import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateFarmDailyLogDto {
  @IsDateString()
  logDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  activities: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  expenseNote?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expenseAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  issues?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500_000)
  photoDataUrl?: string | null;
}
