import { IsString, IsNotEmpty } from 'class-validator';

export class MarkNotificationReadDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}
