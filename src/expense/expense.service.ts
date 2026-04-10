import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Expense } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(auth: AuthUser): Promise<Expense[]> {
    if (auth.role === 'admin') {
      return this.prisma.expense.findMany({ orderBy: { date: 'desc' } });
    }
    if (auth.role === 'trader') {
      return [];
    }
    return this.prisma.expense.findMany({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' },
    });
  }

  async create(dto: CreateExpenseDto, auth: AuthUser): Promise<Expense> {
    if (auth.role === 'trader') {
      throw new ForbiddenException();
    }
    return this.prisma.expense.create({
      data: {
        userId: auth.userId,
        label: dto.label.trim(),
        amount: dto.amount,
        date: new Date(dto.date),
      },
    });
  }
}
