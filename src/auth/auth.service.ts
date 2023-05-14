import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { emailConfirm } from '../common/emailTemplates/emailConfirm';
import { VerificationTokenPayloadInterface } from './interfaces/verificationTokenPayload.interface';
import e from 'express';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    // import해서 userService를 읽기전용으로 가져온다.
    private readonly userService: UserService,
    // 토큰 생성및 조회에 사용
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async createUserByEmail(creatUserDto: CreateUserDto) {
    const newUser = await this.userService.createUser(creatUserDto);
    // password는 undefined로 한다.(노출 x)
    // 0509 삭제
    // newUser.password = undefined;
    return newUser;
  }

  // 로그인 함수
  // 이메일 체크, 비밀번호 매칭, jwt 리턴
  async getAuthenticatedUser(email: string, password: string) {
    try {
      // 이메일 체크
      const user = await this.userService.findUserByEmail(email);

      // password 체크 값 비교
      const isMatching = await bcrypt.compare(password, user.password);
      if (!isMatching) {
        throw new HttpException('Password do Not Match', HttpStatus.CONFLICT);
      }
      user.password = undefined;
      return user;
    } catch (err) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public generateAccessToken(userId: string) {
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESSTOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESSTOKEN_EXPIRATION_TIME',
      )}s`,
    });
    return token;
  }

  public sendEmail(email: string) {
    return this.emailService.sendMail({
      to: email,
      subject: 'Email 테스트',
      html: emailConfirm('진재윤', 'http://localhost:3000/'),
    });
  }

  public sendEmailWithToken(email: string, title: string, tokenInfo: any) {
    const payload: VerificationTokenPayloadInterface = { email };
    // const token = this.jwtService.sign(payload, {
    //   // secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
    //   // expiresIn: `${this.configService.get(
    //   //   'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
    //   // )}s`,
    //   secret: tokenSecret,
    //   expiresIn: tokenExpTime,
    // });
    const token = this.jwtService.sign(payload, tokenInfo);

    const url = `${this.configService.get(
      'FRONTEND_DEFAULT_URL',
    )}/auth/reset-pw?token=${token}`;

    return this.emailService.sendMail({
      to: email,
      subject: `${title}`,
      html: emailConfirm('진재윤', url),
    });
  }

  public async sendEmailOfRendomNumber(email: string) {
    const randomNumber = Math.floor(Math.random() * 1000000);
    await this.emailService.sendMail({
      to: email,
      subject: 'Email Confirmaiton',
      text: `${randomNumber}`,
    });
    return randomNumber;
  }

  public async decodeConfirmaitonToken(token: string, tokenSecret: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        // secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        secret: tokenSecret,
      });
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException('not Email');
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  //email 컨펌 함수
  public async confirmEmail(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (user.isEmailConfirm) {
      throw new BadRequestException('email is already confirm');
    }
    return this.userService.markEmailAsConfirmed(email);
  }

  public async changePasswordBeforeLogin(email: string, newPassword: string) {
    await this.userService.findUserByEmail(email);
    return this.userService.changePassword(email, newPassword);
  }

  public async sendSMS(phone: string) {
    return await this.smsService.initiatePhoneNumberVerification(phone);
  }

  public async checkSMS(phone: string, code: string) {
    return await this.smsService.confirmPhoneVerification(phone, code);
  }
}
