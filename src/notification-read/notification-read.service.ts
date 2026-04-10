import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth-user.interface';

@Injectable()
export class NotificationReadService {
  constructor(private readonly prisma: PrismaService) {}

  async getKeys(auth: AuthUser): Promise<{ keys: string[] }> {
    const rows = await this.prisma.notificationRead.findMany({
      where: { userId: auth.userId },
      select: { key: true },
    });
    return { keys: rows.map((r) => r.key) };
  }

  async markRead(auth: AuthUser, key: string) {
    const k = key.trim();
    if (!k) return { ok: true };
    await this.prisma.notificationRead.upsert({
      where: {
        userId_key: { userId: auth.userId, key: k },
      },
      create: { userId: auth.userId, key: k },
      update: {},
    });
    return { ok: true };
  }
}
