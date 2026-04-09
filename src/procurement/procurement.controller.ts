import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { ProcurementQueryDto } from './dto/procurement-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/procurements')
@UseGuards(JwtAuthGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get()
  findAll(
    @Query() query: ProcurementQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.procurementService.findAll(query, user);
  }

  @Post()
  create(
    @Body() dto: CreateProcurementDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.procurementService.create(dto, user);
  }
}
