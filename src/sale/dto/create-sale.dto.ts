import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  produce: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  buyer: string;

  @IsOptional()
  @IsString()
  @IsIn(['paid', 'partial', 'credit'])
  paymentStatus?: 'paid' | 'partial' | 'credit';

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsDateString()
  creditDueDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
