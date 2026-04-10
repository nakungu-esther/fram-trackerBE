import { Module } from '@nestjs/common';
import { SeasonalPlanService } from './seasonal-plan.service';
import { SeasonalPlanController } from './seasonal-plan.controller';

@Module({
  controllers: [SeasonalPlanController],
  providers: [SeasonalPlanService],
})
export class SeasonalPlanModule {}
