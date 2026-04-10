import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Sale } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PatchSaleDto } from './dto/patch-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';

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
  constructor(private readonly prisma: PrismaService) {}

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

    const paid = normalizeAmountPaid(
      dto.amount,
      paymentStatus,
      dto.amountPaid,
    );

    return this.prisma.sale.create({
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
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
    });
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

    return this.prisma.sale.update({
      where: { id },
      data: {
        paymentStatus: 'paid',
        amountPaid: row.amount,
        suiTxDigest: digest,
      },
    });
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

    const data: Prisma.SaleUpdateInput = {};
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

    return this.prisma.sale.update({
      where: { id },
      data,
    });
  }
}
