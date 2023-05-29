import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Provider } from '../../user/entities/provider.enum';

// strategy 호출 용도 파일

@Injectable()
export class LocalAuthGuard extends AuthGuard(Provider.LOCAL) {}
