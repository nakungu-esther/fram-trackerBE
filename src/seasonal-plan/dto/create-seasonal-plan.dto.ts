import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateSeasonalPlanDto {
  @IsString()
  @IsNotEmpty()
  crop: string;

  @IsDateString()
  plantDate: string;

  @IsDateString()
  expectedHarvestDate: string;

  @IsOptional()
  @IsString()
  farmId?: string | null;

  @IsOptional()
  @IsString()
  notes?: string;
}
