import type { Sale } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';
export declare class SaleService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: SaleQueryDto, auth: AuthUser): Promise<Sale[]>;
    create(dto: CreateSaleDto, auth: AuthUser): Promise<Sale>;
}
