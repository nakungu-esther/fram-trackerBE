import type { SmsLog } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmsLogDto } from './dto/create-sms-log.dto';
export declare class SmsLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(auth: AuthUser): Promise<SmsLog[]>;
    create(dto: CreateSmsLogDto, auth: AuthUser): Promise<SmsLog>;
}
