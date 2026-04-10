import { ForbiddenException, Injectable } from '@nestjs/common';
import type { SeasonalPlan } from '@prisma/client';
import type { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonalPlanDto } from './dto/create-seasonal-plan.dto';

@Injectable()
export class SeasonalPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(auth: AuthUser): Promise<SeasonalPlan[]> {
    if (auth.role === 'admin') {
      return this.prisma.seasonalPlan.findMany({ orderBy: { plantDate: 'desc' } });
    }
    if (auth.role === 'trader') return [];
    return this.prisma.seasonalPlan.findMany({
      where: { userId: auth.userId },
      orderBy: { plantDate: 'desc' },
    });
  }

  private async assertFarmOwned(farmId: string | null | undefined, userId: string) {
    if (!farmId) return;
    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, userId },
    });
    if (!farm) throw new ForbiddenException('Farm not found or not owned by this user');
  }

  async create(dto: CreateSeasonalPlanDto, auth: AuthUser): Promise<SeasonalPlan> {
    if (auth.role === 'trader') throw new ForbiddenException();
    const farmId = dto.farmId?.trim() || null;
    await this.assertFarmOwned(farmId, auth.userId);
    return this.prisma.seasonalPlan.create({
      data: {
        userId: auth.userId,
        crop: dto.crop.trim(),
        plantDate: new Date(dto.plantDate),
        expectedHarvestDate: new Date(dto.expectedHarvestDate),
        farmId,
        notes: dto.notes?.trim() || null,
      },
    });
  }
}
