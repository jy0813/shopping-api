import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from "../user/dto/create-user.dto";
import { LoginUserDto } from "../user/dto/login-user.dto";


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('/signup')
  // 사용자 body(입력 값)은 createUserDto에 입력값을 사용한다.
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUserByEmail(createUserDto);
  }

  @Post('/login')
  async loggedInUser(@Body() loginUserDto: LoginUserDto) {

  }
}
