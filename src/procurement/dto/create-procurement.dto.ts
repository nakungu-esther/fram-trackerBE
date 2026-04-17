import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateProcurementDto {
  @IsString()
  @IsNotEmpty()
  produce: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  farmLocation?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  farmId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500_000)
  photoDataUrl?: string | null;
}
