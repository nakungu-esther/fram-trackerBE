import { IsNumber, Min, IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

export class PatchSaleDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'paid', 'partial', 'credit'])
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'credit';

  @IsOptional()
  @IsString()
  @IsIn(['sui', 'credit', 'manual'])
  settlementMethod?: 'sui' | 'credit' | 'manual' | null;

  @IsOptional()
  @IsString()
  suiTxDigest?: string | null;

  @IsOptional()
  @IsDateString()
  creditDueDate?: string | null;
}
