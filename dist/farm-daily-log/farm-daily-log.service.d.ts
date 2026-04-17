import type { FarmDailyLog } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateFarmDailyLogDto } from './dto/create-farm-daily-log.dto';
import { FarmDailyLogQueryDto } from './dto/farm-daily-log-query.dto';
export declare class FarmDailyLogService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditLogService);
    findAll(query: FarmDailyLogQueryDto, auth: AuthUser): Promise<FarmDailyLog[]>;
    create(dto: CreateFarmDailyLogDto, auth: AuthUser): Promise<FarmDailyLog>;
}
