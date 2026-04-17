import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { FarmDailyLogService } from './farm-daily-log.service';
import { CreateFarmDailyLogDto } from './dto/create-farm-daily-log.dto';
import { FarmDailyLogQueryDto } from './dto/farm-daily-log-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/farm-daily-logs')
@UseGuards(JwtAuthGuard)
export class FarmDailyLogController {
  constructor(private readonly farmDailyLogService: FarmDailyLogService) {}

  @Get()
  findAll(@Query() query: FarmDailyLogQueryDto, @CurrentUser() user: AuthUser) {
    return this.farmDailyLogService.findAll(query, user);
  }

  @Post()
  create(@Body() dto: CreateFarmDailyLogDto, @CurrentUser() user: AuthUser) {
    return this.farmDailyLogService.create(dto, user);
  }
}
