import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
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
}
