import { RoleEnum } from '../../user/entities/role.enum';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import JwtAccessTokenGuard from './jwt-access-token.guard';
import { RequestWithUser } from '../interfaces/requestWithUser';

export const RoleGuard = (role: RoleEnum): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAccessTokenGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const req = context.switchToHttp().getRequest<RequestWithUser>();
      const user = req.user;
      return user?.roles.includes(role);
    }
  }
  return mixin(RoleGuardMixin);
};
