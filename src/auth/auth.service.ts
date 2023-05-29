import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
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
import { SmsService } from '../sms/sms.service';
import { Provider } from '../user/entities/provider.enum';
import { Cache } from 'cache-manager';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createUserByEmail(creatUserDto: CreateUserDto) {
    try {
      const newUser = await this.userService.createUser({
        ...creatUserDto,
        provider: Provider.LOCAL,
      });
      // password는 undefined로 한다.(노출 x)
      // 0509 삭제
      // newUser.password = undefined;
      return newUser;
    } catch (err) {
      if (err?.code === 23505) {
        throw new HttpException(
          'user with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      } else if (err?.code === 23502) {
        throw new HttpException(
          'please check not null body value',
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log(err);
      throw new HttpException(
        'something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      await this.cacheManager.set(user.id, user);
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
      )}m`,
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_ACCESSTOKEN_EXPIRATION_TIME',
    )}`;
  }

  public generateRefreshToken(userId: string) {
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESHTOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESHTOKEN_EXPIRATION_TIME',
      )}d`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESHTOKEN_EXPIRATION_TIME',
    )}`;

    return { cookie, token };
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
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
    await this.cacheManager.set(email, randomNumber);
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

  public async snsAuthUser(
    email: string,
    userName: string,
    provider: Provider,
  ) {
    // // 이메일 존재하면 로그인
    // const user = await this.userService.findUserByEmail(email);
    // // 이메일 존재하지 않으면 회원가입
    // if (!user) {
    //   return await this.userService.socialAuth(email, userName, provider);
    // }
    // const accessTokenCookie = await this.generateAccessToken(user.id);
    // const { cookie: refreshTokenCookie, token: refreshToken } = await this.generateRefreshToken(user.id);
    // return
  }
}
