import { SmsLogService } from './sms-log.service';
import { CreateSmsLogDto } from './dto/create-sms-log.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class SmsLogController {
    private readonly smsLogService;
    constructor(smsLogService: SmsLogService);
    findAll(user: AuthUser): Promise<{
        userId: string;
        id: string;
        at: Date;
        to: string;
        body: string;
        kind: string;
    }[]>;
    create(dto: CreateSmsLogDto, user: AuthUser): Promise<{
        userId: string;
        id: string;
        at: Date;
        to: string;
        body: string;
        kind: string;
    }>;
}
