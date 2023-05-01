import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from "../user/user.module";

@Module({
  // user에 관한 entity 및 service import로 이용가능
  imports: [
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
