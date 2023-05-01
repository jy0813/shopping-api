import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    // user 테이블에 접근하겠다.
    @InjectRepository(User)
    private userRepo: Repository<User>, // repository는 user table 이다.
  ) {}

  // user email 찾는 함수
  async findUserByEmail(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      // 에러 처리 구문
      throw new HttpException(
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async findUserById(id: string) {
    const user = await this.userRepo.findBy({ id });
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  // 사용자 입력값은 dto다.
  async createUser(createUserDto: CreateUserDto) {
    const newUser = await this.userRepo.create(createUserDto);
    await this.userRepo.save(newUser);
    return newUser;
  }

  async getAllUsers() {
    const users = await this.userRepo.find();
    return users;
  }
}
