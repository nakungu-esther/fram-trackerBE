import type { SupplyChainEvent } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplyEventDto } from './dto/create-supply-event.dto';
export declare class SupplyChainService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private saleKeysForAuth;
    findAll(auth: AuthUser): Promise<SupplyChainEvent[]>;
    create(dto: CreateSupplyEventDto, auth: AuthUser): Promise<SupplyChainEvent>;
}
