import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RequestWithUser } from './interfaces/requestWithUser';
import JwtAuthGuard from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  // 사용자 body(입력 값)은 createUserDto에 입력값을 사용한다.
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUserByEmail(createUserDto);
  }

  // @UseGuards(AuthGuard('local')
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async loggedInUser(@Req() req: RequestWithUser) {
    const { user } = req;
    const token = await this.authService.generateAccessToken(user.id);
    return { user, token };
  }

  // @Post('/login')
  // async loggedInUser(@Body() loginUserDto: LoginUserDto) {
  //   const user = await this.authService.getAuthenticatedUser(
  //     loginUserDto.email,
  //     loginUserDto.password,
  //   );
  //   // token 불러오기
  //   const token = await this.authService.generateAccessToken(user.id);
  //   return { user, token };
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/userInfo')
  async getUserInfo(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Post('/email')
  async sendEmail(@Body('email') email: string) {
    await this.authService.sendEmail(email);
    return 'successful send email';
  }
}
