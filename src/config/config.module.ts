import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
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
        JWT_ACCESSTOKEN_EXPIRATION_TIME: Joi.string().required(),
        // JWT Email 환경변수 타입 체크
        JWT_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        // JWT Password 환경변수
        JWT_CHANGEPASSWORD_TOKEN_SECRET: Joi.string().required(),
        JWT_CHANGEPASSWORD_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        // email default Url
        FRONTEND_DEFAULT_URL: Joi.string().required(),
        // email 환경변수 타입 체크
        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        // sms 환경변수
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required(),
        TWILIO_PHONE_NUMBER: Joi.string().required(),
      }),
    }),
  ],
})
export class AppConfigModule {}
