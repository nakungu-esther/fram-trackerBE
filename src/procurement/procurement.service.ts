import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Procurement } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';
import { ProcurementQueryDto } from './dto/procurement-query.dto';

function snapshotProcurement(row: Procurement) {
  return {
    id: row.id,
    produce: row.produce,
    quantity: row.quantity,
    price: row.price,
    farmLocation: row.farmLocation,
    userId: row.userId,
    farmId: row.farmId,
    date: row.date,
    updatedAt: row.updatedAt,
    photoDataUrl: row.photoDataUrl ? '[photo]' : null,
    createdByUserId: row.createdByUserId,
    lastUpdatedByUserId: row.lastUpdatedByUserId,
  };
}

@Injectable()
export class ProcurementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  private async isProcurementLocked(procurementId: number): Promise<boolean> {
    const linked = await this.prisma.sale.findMany({
      where: { procurementId },
    });
    return linked.some(
      (s) =>
        !!s.suiTxDigest ||
        (s.paymentStatus === 'paid' &&
          (s.amountPaid ?? 0) >= s.amount - 1e-9),
    );
  }

  async findAll(query: ProcurementQueryDto, auth: AuthUser): Promise<Procurement[]> {
    const where: Prisma.ProcurementWhereInput = {};
    if (auth.role === 'admin') {
      if (query.userId) where.userId = query.userId.trim();
    } else if (auth.role === 'trader') {
      /* Marketplace: all listed produce (read-only at controller level). */
    } else {
      where.userId = auth.userId;
    }
    return this.prisma.procurement.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  private async assertFarmOwned(farmId: string | null | undefined, userId: string) {
    if (!farmId) return;
    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, userId },
    });
    if (!farm) {
      throw new ForbiddenException('Farm not found or not owned by this user');
    }
  }

  async create(dto: CreateProcurementDto, auth: AuthUser): Promise<Procurement> {
    if (auth.role === 'trader') {
      throw new ForbiddenException('Traders cannot record harvests');
    }
    let userId: string;
    if (auth.role === 'admin') {
      userId = (dto.userId?.trim() || auth.userId) as string;
    } else {
      userId = auth.userId;
    }
    if (dto.quantity < 0 || !Number.isFinite(dto.quantity)) {
      throw new BadRequestException('Harvest quantity cannot be negative');
    }
    const price = dto.price ?? 0;
    if (price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }
    const farmId = dto.farmId?.trim() || null;
    await this.assertFarmOwned(farmId, userId);
    const created = await this.prisma.procurement.create({
      data: {
        produce: dto.produce.trim(),
        quantity: dto.quantity,
        price,
        farmLocation: dto.farmLocation?.trim() || null,
        userId,
        farmId,
        photoDataUrl: dto.photoDataUrl?.trim() || null,
        createdByUserId: auth.userId,
        lastUpdatedByUserId: auth.userId,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
    });
    await this.audit.record({
      action: 'CREATE_PROCUREMENT',
      entityType: 'Procurement',
      entityId: String(created.id),
      auth,
      newValue: snapshotProcurement(created),
    });
    return created;
  }

  async update(
    id: number,
    dto: UpdateProcurementDto,
    auth: AuthUser,
  ): Promise<Procurement> {
    const row = await this.prisma.procurement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Procurement not found');
    if (auth.role !== 'admin' && row.userId !== auth.userId) {
      throw new ForbiddenException();
    }
    if (await this.isProcurementLocked(id)) {
      throw new BadRequestException(
        'This harvest is linked to a finalized sale (paid or on-chain). Edits are disabled — add a new harvest/adjustment row instead of changing history.',
      );
    }
    if (dto.farmId !== undefined) {
      const trimmed = dto.farmId?.trim() || null;
      if (trimmed) {
        await this.assertFarmOwned(trimmed, row.userId || auth.userId);
      }
    }
    if (dto.quantity !== undefined) {
      if (dto.quantity < 0 || !Number.isFinite(dto.quantity)) {
        throw new BadRequestException('Quantity cannot be negative');
      }
    }
    const before = snapshotProcurement(row);
    const data: Prisma.ProcurementUpdateInput = {
      lastUpdatedByUser: { connect: { id: auth.userId } },
    };
    if (dto.produce !== undefined) data.produce = dto.produce.trim();
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.farmLocation !== undefined) {
      data.farmLocation = dto.farmLocation?.trim() || null;
    }
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.photoDataUrl !== undefined) {
      data.photoDataUrl = dto.photoDataUrl?.trim() || null;
    }
    if (dto.farmId !== undefined) {
      const trimmed = dto.farmId?.trim() || null;
      data.farm = trimmed
        ? { connect: { id: trimmed } }
        : { disconnect: true };
    }
    const updated = await this.prisma.procurement.update({
      where: { id },
      data,
    });
    await this.audit.record({
      action: 'UPDATE_PROCUREMENT',
      entityType: 'Procurement',
      entityId: String(id),
      auth,
      oldValue: before,
      newValue: snapshotProcurement(updated),
    });
    return updated;
  }

  async remove(id: number, auth: AuthUser): Promise<void> {
    const row = await this.prisma.procurement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Procurement not found');
    if (auth.role !== 'admin' && row.userId !== auth.userId) {
      throw new ForbiddenException();
    }
    const saleCount = await this.prisma.sale.count({ where: { procurementId: id } });
    if (saleCount > 0) {
      throw new BadRequestException(
        'Cannot delete harvest — one or more sales reference it. Keep the record for audit integrity.',
      );
    }
    if (await this.isProcurementLocked(id)) {
      throw new BadRequestException('Cannot delete a harvest that is locked by finalized sales.');
    }
    await this.audit.record({
      action: 'DELETE_PROCUREMENT',
      entityType: 'Procurement',
      entityId: String(id),
      auth,
      oldValue: snapshotProcurement(row),
    });
    await this.prisma.procurement.delete({ where: { id } });
  }
}
