import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { AppConfigModule } from './config/config.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    UserModule,
    ProductModule,
    AuthModule,
    EmailModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
