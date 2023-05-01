import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';


// api user 모듈에 대한 default api /user
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  // @Get(api url path 설정) methods
  @Get('/all')
  async getAllUsersApi() {
    return await this.userService.getAllUsers();
  }

}
