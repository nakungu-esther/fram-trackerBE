import { NotificationReadService } from './notification-read.service';
import { MarkNotificationReadDto } from './dto/mark-read.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class NotificationReadController {
    private readonly notificationReadService;
    constructor(notificationReadService: NotificationReadService);
    getKeys(user: AuthUser): Promise<{
        keys: string[];
    }>;
    markRead(dto: MarkNotificationReadDto, user: AuthUser): Promise<{
        ok: boolean;
    }>;
}
