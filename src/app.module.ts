import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from "@nestjs/config";
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from "@hapi/joi";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        // DB 환경변수 타입 체크
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        // JWT Token 환경변수 타입 체크
        JWT_ACCESSTOKEN_SECRET: Joi.string().required(),
        JWT_ACCESSTOKEN_EXPIRATION_TIME: Joi.string().required()
      }),
    }),
    DatabaseModule,
    UserModule,
    ProductModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
