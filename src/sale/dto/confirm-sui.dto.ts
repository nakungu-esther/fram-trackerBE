import { IsString, MinLength, MaxLength } from 'class-validator';

export class ConfirmSuiDto {
  @IsString()
  @MinLength(20)
  @MaxLength(128)
  digest: string;
}
