import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';
import { ProviderEnum } from '../../user/entities/provider.enum';

@Injectable()
// email, password 검증 라이브러리
export class LocalAuthStrategy extends PassportStrategy(
  Strategy,
  ProviderEnum.LOCAL,
) {
  constructor(private readonly authService: AuthService) {
    // 검증기준
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<User> {
    return this.authService.getAuthenticatedUser(email, password);
  }
}
