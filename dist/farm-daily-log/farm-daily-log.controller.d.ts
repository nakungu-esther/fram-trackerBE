import { FarmDailyLogService } from './farm-daily-log.service';
import { CreateFarmDailyLogDto } from './dto/create-farm-daily-log.dto';
import { FarmDailyLogQueryDto } from './dto/farm-daily-log-query.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class FarmDailyLogController {
    private readonly farmDailyLogService;
    constructor(farmDailyLogService: FarmDailyLogService);
    findAll(query: FarmDailyLogQueryDto, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        photoDataUrl: string | null;
        logDate: Date;
        activities: string;
        expenseNote: string | null;
        expenseAmount: number | null;
        issues: string | null;
    }[]>;
    create(dto: CreateFarmDailyLogDto, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        photoDataUrl: string | null;
        logDate: Date;
        activities: string;
        expenseNote: string | null;
        expenseAmount: number | null;
        issues: string | null;
    }>;
}
