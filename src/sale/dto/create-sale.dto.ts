import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsIn,
  IsInt,
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
  @IsIn(['pending', 'paid', 'partial', 'credit'])
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'credit';

  @IsOptional()
  @IsString()
  @IsIn(['sui', 'credit', 'manual'])
  settlementMethod?: 'sui' | 'credit' | 'manual';

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
  @IsInt()
  @Min(1)
  procurementId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
