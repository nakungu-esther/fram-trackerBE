import { AuditLogService } from './audit-log.service';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(user: AuthUser): Promise<{
        action: string;
        entityType: string;
        entityId: string;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        actorEmail: string | null;
        actorName: string | null;
        actorRole: string | null;
        actorUserId: string | null;
    }[]>;
}
