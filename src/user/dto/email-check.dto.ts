import { IsEmail } from 'class-validator';

export class EmailCheckDto {
  @IsEmail()
  email: string;
}
