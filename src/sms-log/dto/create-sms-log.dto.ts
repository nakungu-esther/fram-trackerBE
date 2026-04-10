import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSmsLogDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  kind: string;
}
