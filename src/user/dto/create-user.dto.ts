import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Provider } from '../entities/provider.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(15)
  userName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-_=+[\]{};:'",.<>/?]{8,}$/,
  )
  password?: string;

  isMarketing?: boolean;

  isEvent?: boolean;

  provider?: Provider;
}
