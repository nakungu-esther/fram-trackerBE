import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class ExpenseController {
    private readonly expenseService;
    constructor(expenseService: ExpenseService);
    findAll(user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        amount: number;
        label: string;
    }[]>;
    create(dto: CreateExpenseDto, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        amount: number;
        label: string;
    }>;
}
