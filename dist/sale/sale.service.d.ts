import type { Sale } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PatchSaleDto } from './dto/patch-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';
import { SuiVerificationService } from '../sui/sui-verification.service';
export declare class SaleService {
    private readonly prisma;
    private readonly audit;
    private readonly suiVerification;
    constructor(prisma: PrismaService, audit: AuditLogService, suiVerification: SuiVerificationService);
    private assertStockAvailable;
    private assertCreditHeadroom;
    private traderCanAccessSale;
    findAll(query: SaleQueryDto, auth: AuthUser): Promise<Sale[]>;
    create(dto: CreateSaleDto, auth: AuthUser): Promise<Sale>;
    confirmSuiPayment(id: number, digest: string, auth: AuthUser): Promise<Sale>;
    patch(id: number, dto: PatchSaleDto, auth: AuthUser): Promise<Sale>;
}
