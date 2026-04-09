import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Prisma, Sale } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';

function normalizeAmountPaid(
  total: number,
  paymentStatus: string,
  amountPaidRaw: number | undefined,
): number {
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

  async findAll(query: SaleQueryDto, auth: AuthUser): Promise<Sale[]> {
    const where: Prisma.SaleWhereInput = {};
    if (auth.role === 'admin') {
      if (query.userId) where.userId = query.userId.trim();
    } else if (auth.role === 'trader') {
      const name = auth.name?.trim();
      if (name) {
        where.buyer = { equals: name, mode: 'insensitive' };
      } else {
        where.buyer = { equals: '__none__' };
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
    if (auth.role === 'trader') {
      throw new ForbiddenException('Traders cannot record farmer sales');
    }
    let userId: string;
    if (auth.role === 'admin') {
      userId = (dto.userId?.trim() || auth.userId) as string;
    } else {
      userId = auth.userId;
    }

    const total = dto.amount;
    const paymentStatus = dto.paymentStatus ?? 'paid';
    const paid = normalizeAmountPaid(total, paymentStatus, dto.amountPaid);

    return this.prisma.sale.create({
      data: {
        produce: dto.produce.trim(),
        quantity: dto.quantity,
        amount: total,
        buyer: dto.buyer.trim(),
        paymentStatus,
        amountPaid: paid,
        creditDueDate: dto.creditDueDate ? new Date(dto.creditDueDate) : null,
        userId,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
    });
  }
}
