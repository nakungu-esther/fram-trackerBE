import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSupplyEventDto {
  @IsString()
  @IsNotEmpty()
  saleId: string;

  @IsString()
  @IsNotEmpty()
  stage: string;

  @IsOptional()
  @IsString()
  note?: string;
}
