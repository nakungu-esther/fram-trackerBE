import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Prisma, Procurement } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
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
    return this.prisma.procurement.create({
      data: {
        produce: dto.produce.trim(),
        quantity: dto.quantity,
        price,
        farmLocation: dto.farmLocation?.trim() || null,
        userId,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
    });
  }
}
