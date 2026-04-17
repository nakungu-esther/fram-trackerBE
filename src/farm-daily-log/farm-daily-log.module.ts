import { Module } from '@nestjs/common';
import { FarmDailyLogService } from './farm-daily-log.service';
import { FarmDailyLogController } from './farm-daily-log.controller';

@Module({
  controllers: [FarmDailyLogController],
  providers: [FarmDailyLogService],
})
export class FarmDailyLogModule {}
