import { Module } from '@nestjs/common';
import { NotificationReadService } from './notification-read.service';
import { NotificationReadController } from './notification-read.controller';

@Module({
  controllers: [NotificationReadController],
  providers: [NotificationReadService],
})
export class NotificationReadModule {}
