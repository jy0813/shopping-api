import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RoleGuard } from '../auth/guard/role.guard';
import { RoleEnum } from './entities/role.enum';

// api user 모듈에 대한 default api /user
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get(api url path 설정) methods
  @UseGuards(RoleGuard(RoleEnum.ADMIN))
  @Get('/all')
  async getAllUsersApi() {
    return await this.userService.getAllUsers();
  }
}
