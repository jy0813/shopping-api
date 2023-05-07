import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RequestWithUser } from './interfaces/requestWithUser';
import JwtAuthGuard from './guard/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { DuplicateEmailDto } from '../user/dto/duplicate-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/duplicate/email')
  async duplicateCheckEmail(@Body() duplicateEmailDto: DuplicateEmailDto) {
    return await this.userService.duplicateFindUserEmail(
      duplicateEmailDto.email,
    );
  }

  @Post('/signup')
  // 사용자 body(입력 값)은 createUserDto에 입력값을 사용한다.
  async registerUser(@Body() createUserDto: CreateUserDto) {
    await this.authService.sendEmailConfirm(
      createUserDto.email,
      '이메일 confirm',
    );
    return await this.authService.createUserByEmail(createUserDto);
  }

  @Post('/email/confirm')
  async emailConfirm(@Body('token') token: string) {
    const email = await this.authService.decodeConfirmaitonToken(token);
    // isEmailConfirm false -> true
    return this.authService.confirmEmail(email);
  }

  @Post('/email/resend')
  async resendEmail(@Body('email') email: string) {
    await this.userService.findUserByEmail(email);
    return await this.authService.sendEmailConfirm(email, '이메일 재전송');
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
    const number = await this.authService.sendEmailOfRendomNumber(email);
    return { number };
  }

  @Post('/email/resend/number')
  async resendEmailOfNumber(@Body('email') email: string) {
    const number = await this.authService.sendEmailOfRendomNumber(email);
    return { number };
  }

  // password 변경
  // 1. email 보내기 (매개변수 : email) token 생성 with email In payload (payload 안에 email 담기)

  @Post('/find/password')
  async resetPassword(@Body('email') email: string) {
    return await this.authService.sendEmailConfirm(email, '비밀번호 변경');
  }
}
