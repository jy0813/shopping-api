import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { ExtractJwt } from 'passport-jwt';
import { User } from '../../user/entities/user.entity';
import { TokenPayloadInterface } from '../interfaces/tokenPayload.interface';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      // oauth2 방식 (검증기준)
      // header 안에 토큰의 위치를 가져오는
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // token 을 풀기 위한 가져오기
      secretOrKey: configService.get('JWT_ACCESSTOKEN_SECRET'),
    });
  }

  async validate(payload: TokenPayloadInterface): Promise<User> {
    return this.userService.findUserById(payload.userId);
  }
}
