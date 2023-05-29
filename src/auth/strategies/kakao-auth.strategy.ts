import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { Provider } from '../../user/entities/provider.enum';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoAuthStrategy extends PassportStrategy(
  Strategy,
  Provider.KAKAO,
) {
  constructor(
    private readonly cfg: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: cfg.get('KAKAO_CLIENT_ID'),
      clientSecret: cfg.get('KAKAO_CLIENT_SECRET'),
      callbackURL: cfg.get('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: any,
  ): Promise<any> {
    /**
     * 로직 정리 필요
     * 0520
     */

    // const user = await this.userService.findUserByEmail(email);
    // const accessTokenCookie = this.authService.generateAccessToken(user.id);
    // const { cookie: refreshTokenCookie, token: localRefreshToken } =
    //   this.authService.generateRefreshToken(user.id);
    // await this.userService.setCurrentRefreshToken(localRefreshToken, user.id);    // email 체크 회원가입
    //     if (!user) {
    //       const newUser = await this.userService.socialAuth(
    //         email,
    //         nickname,
    //         Provider.KAKAO,
    //       );
    //       return { newUser, accessTokenCookie, refreshTokenCookie };
    //     }
    //     // email 로그인
    //     return { user, accessTokenCookie, refreshTokenCookie };
    const { email } = profile._json.kakao_account;
    const { username } = profile;
    try {
      // 로그인
      const user = await this.userService.findUserByEmail(email);
      if (user.provider !== Provider.KAKAO) {
        throw new HttpException(
          `You are already subscribed to ${user.provider}`,
          HttpStatus.CONFLICT,
        );
      }
      done(null, user);
    } catch (err) {
      if (err.status === 404) {
        // 회원가입
        const newUser = await this.userService.createUser({
          provider: Provider.KAKAO,
          userName: username,
          email,
        });

        done(null, newUser);
      }
    }
  }
}
