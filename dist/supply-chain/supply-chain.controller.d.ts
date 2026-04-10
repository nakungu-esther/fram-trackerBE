import { SupplyChainService } from './supply-chain.service';
import { CreateSupplyEventDto } from './dto/create-supply-event.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class SupplyChainController {
    private readonly supplyChainService;
    constructor(supplyChainService: SupplyChainService);
    findAll(user: AuthUser): Promise<{
        userId: string | null;
        id: string;
        at: Date;
        saleId: string;
        stage: string;
        note: string | null;
    }[]>;
    create(dto: CreateSupplyEventDto, user: AuthUser): Promise<{
        userId: string | null;
        id: string;
        at: Date;
        saleId: string;
        stage: string;
        note: string | null;
    }>;
}
