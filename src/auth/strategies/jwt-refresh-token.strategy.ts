import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { Request } from 'express';
import { TokenPayloadInterface } from '../interfaces/tokenPayload.interface';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly cfg: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.Refresh;
        },
      ]),
      secretOrKey: cfg.get('JWT_REFRESHTOKEN_SECRET'),
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: TokenPayloadInterface) {
    const refreshToken = req?.cookies?.Refresh;
    console.log('+++++++++++++++++++++++++', refreshToken);
    return this.userService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.userId,
    );
  }
}
