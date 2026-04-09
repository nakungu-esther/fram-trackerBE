import { IsOptional, IsString } from 'class-validator';

export class SaleQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
