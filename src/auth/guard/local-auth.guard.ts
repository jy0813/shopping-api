import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// strategy 호출 용도 파일

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
