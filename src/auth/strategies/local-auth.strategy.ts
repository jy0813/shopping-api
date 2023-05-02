import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
// email, password 검증 라이브러리
export class LocalAuthStrategy extends PassportStrategy(Strategy) {}
