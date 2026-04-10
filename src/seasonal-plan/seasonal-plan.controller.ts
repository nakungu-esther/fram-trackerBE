import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SeasonalPlanService } from './seasonal-plan.service';
import { CreateSeasonalPlanDto } from './dto/create-seasonal-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/seasonal-plans')
@UseGuards(JwtAuthGuard)
export class SeasonalPlanController {
  constructor(private readonly seasonalPlanService: SeasonalPlanService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.seasonalPlanService.findAll(user);
  }

  @Post()
  create(@Body() dto: CreateSeasonalPlanDto, @CurrentUser() user: AuthUser) {
    return this.seasonalPlanService.create(dto, user);
  }
}
