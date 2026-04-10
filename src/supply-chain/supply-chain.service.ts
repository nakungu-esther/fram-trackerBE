import { Injectable } from '@nestjs/common';
import type { SupplyChainEvent } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplyEventDto } from './dto/create-supply-event.dto';

@Injectable()
export class SupplyChainService {
  constructor(private readonly prisma: PrismaService) {}

  private saleKeysForAuth(auth: AuthUser): Promise<string[]> {
    if (auth.role === 'admin') {
      return this.prisma.sale
        .findMany({ select: { id: true } })
        .then((rows) => rows.map((r) => `api-${r.id}`));
    }
    if (auth.role === 'trader') {
      const name = auth.name?.trim();
      if (!name) return Promise.resolve([]);
      return this.prisma.sale
        .findMany({
          where: { buyer: { equals: name, mode: 'insensitive' } },
          select: { id: true },
        })
        .then((rows) => rows.map((r) => `api-${r.id}`));
    }
    return this.prisma.sale
      .findMany({
        where: { userId: auth.userId },
        select: { id: true },
      })
      .then((rows) => rows.map((r) => `api-${r.id}`));
  }

  async findAll(auth: AuthUser): Promise<SupplyChainEvent[]> {
    const keys = await this.saleKeysForAuth(auth);
    if (auth.role === 'admin') {
      return this.prisma.supplyChainEvent.findMany({ orderBy: { at: 'asc' } });
    }
    return this.prisma.supplyChainEvent.findMany({
      where: {
        OR: [{ saleId: { in: keys } }, { userId: auth.userId }],
      },
      orderBy: { at: 'asc' },
    });
  }

  async create(dto: CreateSupplyEventDto, auth: AuthUser): Promise<SupplyChainEvent> {
    return this.prisma.supplyChainEvent.create({
      data: {
        saleId: dto.saleId.trim(),
        stage: dto.stage.trim(),
        note: dto.note?.trim() || null,
        userId: auth.userId,
      },
    });
  }
}
