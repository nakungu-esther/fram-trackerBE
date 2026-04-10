import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SmsLogService } from './sms-log.service';
import { CreateSmsLogDto } from './dto/create-sms-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/sms-logs')
@UseGuards(JwtAuthGuard)
export class SmsLogController {
  constructor(private readonly smsLogService: SmsLogService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.smsLogService.findAll(user);
  }

  @Post()
  create(@Body() dto: CreateSmsLogDto, @CurrentUser() user: AuthUser) {
    return this.smsLogService.create(dto, user);
  }
}
