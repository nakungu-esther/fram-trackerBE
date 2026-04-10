import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SupplyChainService } from './supply-chain.service';
import { CreateSupplyEventDto } from './dto/create-supply-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/supply-chain-events')
@UseGuards(JwtAuthGuard)
export class SupplyChainController {
  constructor(private readonly supplyChainService: SupplyChainService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.supplyChainService.findAll(user);
  }

  @Post()
  create(@Body() dto: CreateSupplyEventDto, @CurrentUser() user: AuthUser) {
    return this.supplyChainService.create(dto, user);
  }
}
