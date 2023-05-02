import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(7)
  @MaxLength(18)
  userName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @MaxLength(18)
  password: string;
  isMarketing: boolean;
  isEvent: boolean;
}
