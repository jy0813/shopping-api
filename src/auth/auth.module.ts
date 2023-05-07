import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { LocalAuthStrategy } from './strategies/local-auth.strategy';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  // user 에 관한 entity 및 service import 로 이용가능
  imports: [
    UserModule,
    // jwt module 호출
    JwtModule.register({}),
    // 환경변수 사용
    ConfigModule,
    // email 임포트
    EmailModule,
  ],
  controllers: [AuthController],
  // 검증할때 사용하는 함수를 등록
  providers: [AuthService, LocalAuthStrategy, JwtAuthStrategy],
})
export class AuthModule {}
