import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Prisma, FarmDailyLog } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateFarmDailyLogDto } from './dto/create-farm-daily-log.dto';
import { FarmDailyLogQueryDto } from './dto/farm-daily-log-query.dto';

@Injectable()
export class FarmDailyLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  async findAll(query: FarmDailyLogQueryDto, auth: AuthUser): Promise<FarmDailyLog[]> {
    const where: Prisma.FarmDailyLogWhereInput = {};
    if (auth.role === 'farmer') {
      where.userId = auth.userId;
    } else if (auth.role === 'admin') {
      if (query.userId?.trim()) where.userId = query.userId.trim();
    }
    /* traders: no userId filter — full visibility for partner oversight */

    return this.prisma.farmDailyLog.findMany({
      where,
      orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });
  }

  async create(dto: CreateFarmDailyLogDto, auth: AuthUser): Promise<FarmDailyLog> {
    if (auth.role !== 'farmer') {
      throw new ForbiddenException('Only farmer accounts may submit daily farm logs');
    }
    const userId = auth.userId;
    const logDate = new Date(`${dto.logDate.slice(0, 10)}T12:00:00.000Z`);
    if (
      dto.expenseAmount != null &&
      (dto.expenseAmount < 0 || !Number.isFinite(dto.expenseAmount))
    ) {
      throw new BadRequestException('Expense amount cannot be negative');
    }
    const created = await this.prisma.farmDailyLog.create({
      data: {
        userId,
        logDate,
        activities: dto.activities.trim(),
        expenseNote: dto.expenseNote?.trim() || null,
        expenseAmount:
          dto.expenseAmount != null && Number.isFinite(dto.expenseAmount)
            ? dto.expenseAmount
            : null,
        issues: dto.issues?.trim() || null,
        photoDataUrl: dto.photoDataUrl?.trim() || null,
      },
    });
    await this.audit.record({
      action: 'CREATE_FARM_DAILY_LOG',
      entityType: 'FarmDailyLog',
      entityId: created.id,
      auth,
      newValue: {
        id: created.id,
        userId: created.userId,
        logDate: created.logDate,
        activities: created.activities,
        expenseNote: created.expenseNote,
        expenseAmount: created.expenseAmount,
        issues: created.issues,
        hasPhoto: !!created.photoDataUrl,
      },
    });
    return created;
  }
}
