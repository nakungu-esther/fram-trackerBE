import { IsString, IsNotEmpty, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;
}
