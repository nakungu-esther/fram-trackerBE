import type { Farm } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
export declare class FarmService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(auth: AuthUser): Promise<Farm[]>;
    create(dto: CreateFarmDto, auth: AuthUser): Promise<Farm>;
}
