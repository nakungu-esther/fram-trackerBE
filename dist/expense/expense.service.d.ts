import type { Expense } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
export declare class ExpenseService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(auth: AuthUser): Promise<Expense[]>;
    create(dto: CreateExpenseDto, auth: AuthUser): Promise<Expense>;
}
