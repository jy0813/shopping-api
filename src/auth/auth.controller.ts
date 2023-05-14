import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RequestWithUser } from './interfaces/requestWithUser';
import JwtAuthGuard from './guard/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { EmailCheckDto } from '../user/dto/email-check.dto';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '../sms/sms.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  //이메일 중복체크
  @Post('/duplicate/email')
  async duplicateCheckEmail(@Body() emailCheckDto: EmailCheckDto) {
    return await this.userService.duplicateFindUserEmail(emailCheckDto.email);
  }

  //비밀번호 재설정 페이지 가입 이메일 체크
  @Post('/subscribed/email')
  async subscribedCheckEmail(@Body() emailCheckDto: EmailCheckDto) {
    return await this.userService.findUserByEmail(emailCheckDto.email);
  }

  @Post('/signup')
  // 사용자 body(입력 값)은 createUserDto에 입력값을 사용한다.
  async registerUser(@Body() createUserDto: CreateUserDto) {
    // 회원 가입 시 이메일 컨펌 환경이 필요할때,
    // await this.authService.sendEmailWithToken(
    //   createUserDto.email,
    //   '이메일 confirm',
    //   {
    //     secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
    //     expiresIn: `${this.configService.get(
    //       'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
    //     )}m`,
    //   },
    // );
    return await this.authService.createUserByEmail(createUserDto);
  }

  // 가입 후 이메일 확인
  // @Post('/email/confirm')
  // async emailConfirm(@Body('token') token: string) {
  //   const email = await this.authService.decodeConfirmaitonToken(
  //     token,
  //     this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
  //   );
  //   // isEmailConfirm false -> true
  //   return this.authService.confirmEmail(email);
  // }

  @Post('/email/resend')
  async resendEmail(@Body('email') email: string) {
    await this.userService.findUserByEmail(email);
    return await this.authService.sendEmailWithToken(email, '이메일 재전송', {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}m`,
    });
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
    return await this.authService.sendEmailWithToken(email, '비밀번호 변경', {
      secret: this.configService.get('JWT_CHANGEPASSWORD_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_CHANGEPASSWORD_TOKEN_EXPIRATION_TIME',
      )}m`,
    });
  }
  // 로그인 전 단계 패스워드 변경
  @Put('/change/password')
  async changePasswordBeforeLogin(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    const email = await this.authService.decodeConfirmaitonToken(
      token,
      this.configService.get('JWT_CHANGEPASSWORD_TOKEN_SECRET'),
    );
    return this.authService.changePasswordBeforeLogin(email, newPassword);
  }

  @Post('/sms/verification')
  async sendSMS(@Body('phone') phone: string) {
    return this.authService.sendSMS(phone);
  }

  @Post('/sms/check')
  async checkSMS(@Body('phone') phone: string, @Body('code') code: string) {
    return this.authService.checkSMS(phone, code);
  }
}
