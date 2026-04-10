import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/farms')
@UseGuards(JwtAuthGuard)
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.farmService.findAll(user);
  }

  @Post()
  create(@Body() dto: CreateFarmDto, @CurrentUser() user: AuthUser) {
    return this.farmService.create(dto, user);
  }
}
