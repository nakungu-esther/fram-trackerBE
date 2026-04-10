import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { CreateProcurementDto } from './dto/create-procurement.dto';
import { UpdateProcurementDto } from './dto/update-procurement.dto';
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

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProcurementDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.procurementService.update(id, dto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.procurementService.remove(id, user);
  }
}
