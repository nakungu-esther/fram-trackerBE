import type { Procurement } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { ProcurementQueryDto } from './dto/procurement-query.dto';
export declare class ProcurementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: ProcurementQueryDto, auth: AuthUser): Promise<Procurement[]>;
    create(dto: CreateProcurementDto, auth: AuthUser): Promise<Procurement>;
}
