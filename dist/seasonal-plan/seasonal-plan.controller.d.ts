import { SeasonalPlanService } from './seasonal-plan.service';
import { CreateSeasonalPlanDto } from './dto/create-seasonal-plan.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class SeasonalPlanController {
    private readonly seasonalPlanService;
    constructor(seasonalPlanService: SeasonalPlanService);
    findAll(user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        farmId: string | null;
        crop: string;
        plantDate: Date;
        expectedHarvestDate: Date;
        notes: string | null;
    }[]>;
    create(dto: CreateSeasonalPlanDto, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        farmId: string | null;
        crop: string;
        plantDate: Date;
        expectedHarvestDate: Date;
        notes: string | null;
    }>;
}
