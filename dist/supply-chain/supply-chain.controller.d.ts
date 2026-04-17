import { SupplyChainService } from './supply-chain.service';
import { CreateSupplyEventDto } from './dto/create-supply-event.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class SupplyChainController {
    private readonly supplyChainService;
    constructor(supplyChainService: SupplyChainService);
    findAll(user: AuthUser): Promise<{
        id: string;
        at: Date;
        userId: string | null;
        saleId: string;
        stage: string;
        note: string | null;
    }[]>;
    create(dto: CreateSupplyEventDto, user: AuthUser): Promise<{
        id: string;
        at: Date;
        userId: string | null;
        saleId: string;
        stage: string;
        note: string | null;
    }>;
}
