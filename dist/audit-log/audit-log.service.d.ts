import type { Prisma } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
export type AuditPayload = {
    action: string;
    entityType: string;
    entityId: string;
    auth: AuthUser;
    oldValue?: unknown;
    newValue?: unknown;
};
export declare class AuditLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    record(payload: AuditPayload): Promise<void>;
    private toJsonValue;
    findRecent(take: number): Promise<{
        action: string;
        entityType: string;
        entityId: string;
        oldValue: Prisma.JsonValue | null;
        newValue: Prisma.JsonValue | null;
        id: string;
        createdAt: Date;
        actorEmail: string | null;
        actorName: string | null;
        actorRole: string | null;
        actorUserId: string | null;
    }[]>;
}
