import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class NotificationReadService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getKeys(auth: AuthUser): Promise<{
        keys: string[];
    }>;
    markRead(auth: AuthUser, key: string): Promise<{
        ok: boolean;
    }>;
}
