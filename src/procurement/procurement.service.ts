import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Procurement } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';
import { ProcurementQueryDto } from './dto/procurement-query.dto';

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

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
    const price = dto.price ?? 0;
    const farmId = dto.farmId?.trim() || null;
    await this.assertFarmOwned(farmId, userId);
    return this.prisma.procurement.create({
      data: {
        produce: dto.produce.trim(),
        quantity: dto.quantity,
        price,
        farmLocation: dto.farmLocation?.trim() || null,
        userId,
        farmId,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
    });
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
    if (dto.farmId !== undefined) {
      const trimmed = dto.farmId?.trim() || null;
      if (trimmed) {
        await this.assertFarmOwned(trimmed, row.userId || auth.userId);
      }
    }
    const data: Prisma.ProcurementUpdateInput = {};
    if (dto.produce !== undefined) data.produce = dto.produce.trim();
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.farmLocation !== undefined) {
      data.farmLocation = dto.farmLocation?.trim() || null;
    }
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.farmId !== undefined) {
      const trimmed = dto.farmId?.trim() || null;
      data.farm = trimmed
        ? { connect: { id: trimmed } }
        : { disconnect: true };
    }
    return this.prisma.procurement.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, auth: AuthUser): Promise<void> {
    const row = await this.prisma.procurement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Procurement not found');
    if (auth.role !== 'admin' && row.userId !== auth.userId) {
      throw new ForbiddenException();
    }
    await this.prisma.procurement.delete({ where: { id } });
  }
}
