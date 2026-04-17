import { IsOptional, IsString } from 'class-validator';

export class FarmDailyLogQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
