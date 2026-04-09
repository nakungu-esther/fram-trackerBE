import { IsOptional, IsString } from 'class-validator';

export class ProcurementQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
