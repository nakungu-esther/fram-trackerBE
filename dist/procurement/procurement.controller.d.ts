import { ProcurementService } from './procurement.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { ProcurementQueryDto } from './dto/procurement-query.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class ProcurementController {
    private readonly procurementService;
    constructor(procurementService: ProcurementService);
    findAll(query: ProcurementQueryDto, user: AuthUser): Promise<{
        produce: string;
        quantity: number;
        price: number;
        farmLocation: string | null;
        userId: string | null;
        date: Date;
        id: number;
    }[]>;
    create(dto: CreateProcurementDto, user: AuthUser): Promise<{
        produce: string;
        quantity: number;
        price: number;
        farmLocation: string | null;
        userId: string | null;
        date: Date;
        id: number;
    }>;
}
