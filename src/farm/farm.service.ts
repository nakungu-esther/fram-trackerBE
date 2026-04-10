import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Farm } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';

@Injectable()
export class FarmService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(auth: AuthUser): Promise<Farm[]> {
    if (auth.role === 'admin') {
      return this.prisma.farm.findMany({ orderBy: { name: 'asc' } });
    }
    return this.prisma.farm.findMany({
      where: { userId: auth.userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateFarmDto, auth: AuthUser): Promise<Farm> {
    if (auth.role === 'trader') {
      throw new ForbiddenException('Traders cannot register farms');
    }
    let userId: string;
    if (auth.role === 'admin') {
      userId = (dto.userId?.trim() || auth.userId) as string;
    } else {
      userId = auth.userId;
    }
    return this.prisma.farm.create({
      data: {
        userId,
        name: dto.name.trim(),
        address: dto.address?.trim() || null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
      },
    });
  }
}
