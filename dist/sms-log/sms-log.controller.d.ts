import { SmsLogService } from './sms-log.service';
import { CreateSmsLogDto } from './dto/create-sms-log.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class SmsLogController {
    private readonly smsLogService;
    constructor(smsLogService: SmsLogService);
    findAll(user: AuthUser): Promise<{
        id: string;
        at: Date;
        userId: string;
        to: string;
        body: string;
        kind: string;
    }[]>;
    create(dto: CreateSmsLogDto, user: AuthUser): Promise<{
        id: string;
        at: Date;
        userId: string;
        to: string;
        body: string;
        kind: string;
    }>;
}
