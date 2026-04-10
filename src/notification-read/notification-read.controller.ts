import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationReadService } from './notification-read.service';
import { MarkNotificationReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/notification-reads')
@UseGuards(JwtAuthGuard)
export class NotificationReadController {
  constructor(private readonly notificationReadService: NotificationReadService) {}

  @Get()
  getKeys(@CurrentUser() user: AuthUser) {
    return this.notificationReadService.getKeys(user);
  }

  @Post()
  markRead(
    @Body() dto: MarkNotificationReadDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.notificationReadService.markRead(user, dto.key);
  }
}
