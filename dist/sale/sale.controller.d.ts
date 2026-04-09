import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class SaleController {
    private readonly saleService;
    constructor(saleService: SaleService);
    findAll(query: SaleQueryDto, user: AuthUser): Promise<{
        produce: string;
        quantity: number;
        userId: string | null;
        date: Date;
        id: number;
        amount: number;
        buyer: string;
        paymentStatus: string;
        amountPaid: number | null;
        creditDueDate: Date | null;
    }[]>;
    create(dto: CreateSaleDto, user: AuthUser): Promise<{
        produce: string;
        quantity: number;
        userId: string | null;
        date: Date;
        id: number;
        amount: number;
        buyer: string;
        paymentStatus: string;
        amountPaid: number | null;
        creditDueDate: Date | null;
    }>;
}
