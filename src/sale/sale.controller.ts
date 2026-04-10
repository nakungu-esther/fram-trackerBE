import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PatchSaleDto } from './dto/patch-sale.dto';
import { ConfirmSuiDto } from './dto/confirm-sui.dto';
import { SaleQueryDto } from './dto/sale-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/sales')
@UseGuards(JwtAuthGuard)
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get()
  findAll(@Query() query: SaleQueryDto, @CurrentUser() user: AuthUser) {
    return this.saleService.findAll(query, user);
  }

  @Post()
  create(@Body() dto: CreateSaleDto, @CurrentUser() user: AuthUser) {
    return this.saleService.create(dto, user);
  }

  @Patch(':id')
  patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PatchSaleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.saleService.patch(id, dto, user);
  }

  /** After trader wallet signs a Sui transfer — links digest and marks sale paid. */
  @Post(':id/confirm-sui')
  confirmSui(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmSuiDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.saleService.confirmSuiPayment(id, dto.digest.trim(), user);
  }
}
