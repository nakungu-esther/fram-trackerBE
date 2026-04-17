import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(payload: AuditPayload): Promise<void> {
    const { action, entityType, entityId, auth, oldValue, newValue } = payload;
    const data: Prisma.AuditLogCreateInput = {
      action,
      entityType,
      entityId,
      actorEmail: auth.email,
      actorName: auth.name,
      actorRole: auth.role,
      actor: { connect: { id: auth.userId } },
    };
    if (oldValue !== undefined) {
      data.oldValue = this.toJsonValue(oldValue);
    }
    if (newValue !== undefined) {
      data.newValue = this.toJsonValue(newValue);
    }
    await this.prisma.auditLog.create({ data });
  }

  private toJsonValue(v: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
  }

  async findRecent(take: number) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
