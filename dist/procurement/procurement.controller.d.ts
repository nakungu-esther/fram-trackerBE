import { ProcurementService } from './procurement.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';
import { ProcurementQueryDto } from './dto/procurement-query.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class ProcurementController {
    private readonly procurementService;
    constructor(procurementService: ProcurementService);
    findAll(query: ProcurementQueryDto, user: AuthUser): Promise<{
        id: number;
        updatedAt: Date;
        produce: string;
        quantity: number;
        price: number;
        farmLocation: string | null;
        userId: string | null;
        date: Date;
        farmId: string | null;
        photoDataUrl: string | null;
        createdByUserId: string | null;
        lastUpdatedByUserId: string | null;
    }[]>;
    create(dto: CreateProcurementDto, user: AuthUser): Promise<{
        id: number;
        updatedAt: Date;
        produce: string;
        quantity: number;
        price: number;
        farmLocation: string | null;
        userId: string | null;
        date: Date;
        farmId: string | null;
        photoDataUrl: string | null;
        createdByUserId: string | null;
        lastUpdatedByUserId: string | null;
    }>;
    update(id: number, dto: UpdateProcurementDto, user: AuthUser): Promise<{
        id: number;
        updatedAt: Date;
        produce: string;
        quantity: number;
        price: number;
        farmLocation: string | null;
        userId: string | null;
        date: Date;
        farmId: string | null;
        photoDataUrl: string | null;
        createdByUserId: string | null;
        lastUpdatedByUserId: string | null;
    }>;
    remove(id: number, user: AuthUser): Promise<void>;
}
