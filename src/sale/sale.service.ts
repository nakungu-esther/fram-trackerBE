import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Sale } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PatchSaleDto } from './dto/patch-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';
import { isSaleLocked, snapshotSale } from './sale-audit.util';
import { SuiVerificationService } from '../sui/sui-verification.service';

function normalizeAmountPaid(
  total: number,
  paymentStatus: string,
  amountPaidRaw: number | undefined,
): number {
  if (paymentStatus === 'pending') return 0;

  let paid =
    amountPaidRaw !== undefined && amountPaidRaw !== null
      ? amountPaidRaw
      : total;

  if (paymentStatus === 'credit') paid = 0;
  if (paymentStatus === 'partial') paid = Math.min(paid, total);
  if (paymentStatus === 'paid') paid = total;

  return paid;
}

@Injectable()
export class SaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly suiVerification: SuiVerificationService,
  ) {}

  private async assertStockAvailable(
    farmerUserId: string,
    produce: string,
    additionalQty: number,
  ): Promise<void> {
    if (additionalQty <= 0) {
      throw new BadRequestException('Sale quantity must be positive');
    }
    const p = produce.trim();
    const harvests = await this.prisma.procurement.findMany({
      where: {
        userId: farmerUserId,
        produce: { equals: p, mode: 'insensitive' },
      },
    });
    const sales = await this.prisma.sale.findMany({
      where: {
        userId: farmerUserId,
        produce: { equals: p, mode: 'insensitive' },
      },
    });
    const h = harvests.reduce((s, x) => s + x.quantity, 0);
    const sold = sales.reduce((s, x) => s + x.quantity, 0);
    const avail = h - sold;
    if (avail + 1e-9 < additionalQty) {
      throw new BadRequestException(
        `Insufficient stock for "${p}". Available ~${avail.toFixed(3)} t; this sale is ${additionalQty} t.`,
      );
    }
  }

  private async assertCreditHeadroom(
    buyerUserId: string,
    additionalUgx: number,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: buyerUserId },
    });
    if (!user || user.role !== 'trader') return;

    const limit = user.creditLimitUgx ?? 1_000_000;
    const open = await this.prisma.sale.findMany({
      where: {
        buyerUserId,
        paymentStatus: { in: ['credit', 'partial'] },
      },
      select: { amount: true, amountPaid: true },
    });
    const outstanding = open.reduce(
      (s, r) => s + Math.max(0, r.amount - (r.amountPaid ?? 0)),
      0,
    );
    if (outstanding + additionalUgx > limit + 1e-6) {
      throw new BadRequestException(
        `Credit limit exceeded (cap UGX ${limit.toFixed(0)}). Current outstanding: UGX ${outstanding.toFixed(0)}.`,
      );
    }
  }

  private traderCanAccessSale(row: Sale, auth: AuthUser): boolean {
    if (auth.role === 'admin') return true;
    if (auth.role !== 'trader') return false;
    const name = auth.name?.trim();
    const nameOk =
      !!name && row.buyer.trim().toLowerCase() === name.toLowerCase();
    const idOk = row.buyerUserId === auth.userId;
    return nameOk || idOk;
  }

  async findAll(query: SaleQueryDto, auth: AuthUser): Promise<Sale[]> {
    const where: Prisma.SaleWhereInput = {};
    if (auth.role === 'admin') {
      if (query.userId) where.userId = query.userId.trim();
    } else if (auth.role === 'trader') {
      const name = auth.name?.trim();
      if (name) {
        where.OR = [
          { buyer: { equals: name, mode: 'insensitive' } },
          { buyerUserId: auth.userId },
        ];
      } else {
        where.buyerUserId = auth.userId;
      }
    } else {
      where.userId = auth.userId;
    }
    return this.prisma.sale.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async create(dto: CreateSaleDto, auth: AuthUser): Promise<Sale> {
    let userId: string;
    let buyerUserId: string | null = null;

    if (auth.role === 'trader') {
      const farmerId = dto.userId?.trim();
      if (!farmerId) {
        throw new ForbiddenException(
          'Traders must supply userId (farmer) for marketplace sales',
        );
      }
      userId = farmerId;
      buyerUserId = auth.userId;
    } else if (auth.role === 'admin') {
      userId = (dto.userId?.trim() || auth.userId) as string;
    } else {
      userId = auth.userId;
    }

    if (dto.quantity <= 0 || !Number.isFinite(dto.quantity)) {
      throw new BadRequestException('Sale quantity must be greater than zero');
    }
    if (dto.amount < 0 || !Number.isFinite(dto.amount)) {
      throw new BadRequestException('Sale amount cannot be negative');
    }

    const paymentStatus = dto.paymentStatus ?? 'paid';
    let settlementMethod =
      dto.settlementMethod ??
      (paymentStatus === 'credit'
        ? 'credit'
        : paymentStatus === 'pending'
          ? 'sui'
          : 'manual');

    if (auth.role === 'trader') {
      if (settlementMethod === 'sui' && paymentStatus !== 'pending') {
        throw new BadRequestException(
          'Sui checkout must use paymentStatus pending until the wallet confirms.',
        );
      }
      if (settlementMethod === 'credit' && paymentStatus !== 'credit') {
        throw new BadRequestException(
          'Credit purchases must use paymentStatus credit.',
        );
      }
      if (
        settlementMethod === 'manual' &&
        paymentStatus !== 'paid' &&
        paymentStatus !== 'partial'
      ) {
        throw new BadRequestException(
          'Manual settlement uses paymentStatus paid or partial.',
        );
      }
    }

    if (paymentStatus === 'credit' && buyerUserId) {
      await this.assertCreditHeadroom(buyerUserId, dto.amount);
    }

    if (dto.procurementId != null) {
      const proc = await this.prisma.procurement.findUnique({
        where: { id: dto.procurementId },
      });
      if (!proc || proc.userId !== userId) {
        throw new BadRequestException(
          'procurementId does not match this farmer listing.',
        );
      }
    }

    await this.assertStockAvailable(userId, dto.produce, dto.quantity);

    if (settlementMethod === 'sui') {
      const farmerRow = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!farmerRow?.suiAddress?.trim()) {
        throw new BadRequestException(
          'Sui settlement requires the farmer to save a Sui wallet address on their profile first.',
        );
      }
    }

    const paid = normalizeAmountPaid(
      dto.amount,
      paymentStatus,
      dto.amountPaid,
    );

    const created = await this.prisma.sale.create({
      data: {
        produce: dto.produce.trim(),
        quantity: dto.quantity,
        amount: dto.amount,
        buyer: dto.buyer.trim(),
        paymentStatus,
        settlementMethod,
        amountPaid: paid,
        creditDueDate: dto.creditDueDate ? new Date(dto.creditDueDate) : null,
        userId,
        buyerUserId,
        procurementId: dto.procurementId ?? null,
        createdByUserId: auth.userId,
        lastUpdatedByUserId: auth.userId,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
    });

    await this.audit.record({
      action: 'CREATE_SALE',
      entityType: 'Sale',
      entityId: String(created.id),
      auth,
      newValue: snapshotSale(created),
    });

    return created;
  }

  async confirmSuiPayment(
    id: number,
    digest: string,
    auth: AuthUser,
  ): Promise<Sale> {
    const row = await this.prisma.sale.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Sale not found');
    if (!this.traderCanAccessSale(row, auth)) {
      throw new ForbiddenException();
    }
    if (row.paymentStatus !== 'pending' || row.settlementMethod !== 'sui') {
      throw new BadRequestException(
        'Sale is not waiting for a Sui payment confirmation.',
      );
    }
    const dup = await this.prisma.sale.findFirst({
      where: { suiTxDigest: digest, NOT: { id } },
    });
    if (dup) {
      throw new BadRequestException('This transaction digest is already linked to another sale.');
    }

    const farmerId = row.userId;
    if (!farmerId) {
      throw new BadRequestException(
        'Sale has no farmer account linked; cannot verify on-chain payment.',
      );
    }

    await this.suiVerification.assertSalePaymentDigest({
      digest,
      farmerUserId: farmerId,
      buyerUserId: row.buyerUserId,
    });

    const before = snapshotSale(row);
    const updated = await this.prisma.sale.update({
      where: { id },
      data: {
        paymentStatus: 'paid',
        amountPaid: row.amount,
        suiTxDigest: digest,
        lastUpdatedByUser: { connect: { id: auth.userId } },
      },
    });

    await this.audit.record({
      action: 'CONFIRM_SUI_SALE',
      entityType: 'Sale',
      entityId: String(id),
      auth,
      oldValue: before,
      newValue: snapshotSale(updated),
    });

    return updated;
  }

  async patch(
    id: number,
    dto: PatchSaleDto,
    auth: AuthUser,
  ): Promise<Sale> {
    const row = await this.prisma.sale.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Sale not found');
    if (auth.role === 'admin') {
      /* ok */
    } else if (auth.role === 'trader') {
      if (!this.traderCanAccessSale(row, auth)) {
        throw new ForbiddenException();
      }
    } else if (row.userId !== auth.userId) {
      throw new ForbiddenException();
    }

    if (isSaleLocked(row)) {
      throw new BadRequestException(
        'This sale is finalized (fully paid or verified on-chain). Direct edits are disabled — record a separate adjustment or reversal entry instead.',
      );
    }

    if (dto.amountPaid !== undefined && dto.amountPaid < 0) {
      throw new BadRequestException('amountPaid cannot be negative');
    }

    if (
      dto.suiTxDigest !== undefined &&
      dto.suiTxDigest !== null &&
      String(dto.suiTxDigest).trim() !== ''
    ) {
      const nextDigest = String(dto.suiTxDigest).trim();
      const dupPatch = await this.prisma.sale.findFirst({
        where: { suiTxDigest: nextDigest, NOT: { id } },
      });
      if (dupPatch) {
        throw new BadRequestException(
          'This transaction digest is already linked to another sale.',
        );
      }
      const farmerIdPatch = row.userId;
      if (!farmerIdPatch) {
        throw new BadRequestException(
          'Sale has no farmer account linked; cannot verify on-chain payment.',
        );
      }
      await this.suiVerification.assertSalePaymentDigest({
        digest: nextDigest,
        farmerUserId: farmerIdPatch,
        buyerUserId: row.buyerUserId,
      });
    }

    const before = snapshotSale(row);

    const data: Prisma.SaleUpdateInput = {
      lastUpdatedByUser: { connect: { id: auth.userId } },
    };
    if (dto.amountPaid !== undefined) data.amountPaid = dto.amountPaid;
    if (dto.paymentStatus !== undefined) data.paymentStatus = dto.paymentStatus;
    if (dto.settlementMethod !== undefined) {
      data.settlementMethod = dto.settlementMethod;
    }
    if (dto.suiTxDigest !== undefined) {
      data.suiTxDigest = dto.suiTxDigest;
    }
    if (dto.creditDueDate !== undefined) {
      data.creditDueDate = dto.creditDueDate
        ? new Date(dto.creditDueDate)
        : null;
    }

    const updated = await this.prisma.sale.update({
      where: { id },
      data,
    });

    await this.audit.record({
      action: 'UPDATE_SALE',
      entityType: 'Sale',
      entityId: String(id),
      auth,
      oldValue: before,
      newValue: snapshotSale(updated),
    });

    return updated;
  }
}
