import type { SeasonalPlan } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonalPlanDto } from './dto/create-seasonal-plan.dto';
export declare class SeasonalPlanService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(auth: AuthUser): Promise<SeasonalPlan[]>;
    private assertFarmOwned;
    create(dto: CreateSeasonalPlanDto, auth: AuthUser): Promise<SeasonalPlan>;
}
