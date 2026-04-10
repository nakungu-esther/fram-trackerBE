import { Injectable } from '@nestjs/common';
import type { SmsLog } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmsLogDto } from './dto/create-sms-log.dto';

@Injectable()
export class SmsLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(auth: AuthUser): Promise<SmsLog[]> {
    if (auth.role === 'admin') {
      return this.prisma.smsLog.findMany({
        orderBy: { at: 'desc' },
        take: 500,
      });
    }
    return this.prisma.smsLog.findMany({
      where: { userId: auth.userId },
      orderBy: { at: 'desc' },
      take: 200,
    });
  }

  async create(dto: CreateSmsLogDto, auth: AuthUser): Promise<SmsLog> {
    return this.prisma.smsLog.create({
      data: {
        userId: auth.userId,
        to: dto.to.trim(),
        body: dto.body.trim(),
        kind: dto.kind.trim(),
      },
    });
  }
}
