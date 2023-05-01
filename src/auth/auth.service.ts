import { Injectable } from '@nestjs/common';
import { UserService } from "../user/user.service";
import { CreateUserDto } from "../user/dto/create-user.dto";


@Injectable()
export class AuthService {

  constructor(
    // import해서 userService를 읽기전용으로 가져온다.
    private readonly userService: UserService,
  ) {}

  async createUserByEmail(creatUserDto: CreateUserDto) {
    const newUser = await this.userService.createUser(creatUserDto);
    // password는 undefined로 한다.(노출 x)
    newUser.password = undefined;
    return newUser;
  }
}
