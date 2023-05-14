import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoAuthStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly cfg: ConfigService) {
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
    const { email } = profile._json.kakao_account;
    const { nickname, profile_image } = profile._json.properties;
    console.log(nickname, profile_image, email);
    // email 체크 회원가입 또는 로그인 처리
  }
}
