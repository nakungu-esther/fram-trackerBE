import { Module } from '@nestjs/common';
import { SmsLogService } from './sms-log.service';
import { SmsLogController } from './sms-log.controller';

@Module({
  controllers: [SmsLogController],
  providers: [SmsLogService],
})
export class SmsLogModule {}
