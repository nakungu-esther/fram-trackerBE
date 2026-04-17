import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class UpdateProcurementDto {
  @IsOptional()
  @IsString()
  produce?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  farmLocation?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  farmId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500_000)
  photoDataUrl?: string | null;
}
