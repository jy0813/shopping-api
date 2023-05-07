import { IsEmail } from 'class-validator';

export class DuplicateEmailDto {
  @IsEmail()
  email: string;
}
