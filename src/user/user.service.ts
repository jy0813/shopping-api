import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

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

  //회원가입 user email check하는 함수
  async duplicateFindUserEmail(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (user) {
      throw new HttpException('Duplicate Email', HttpStatus.BAD_REQUEST);
    }
    return 'available email';
  }

  // findOnebye  - object로 return
  // findBy - array return
  async findUserById(id: string) {
    const user = await this.userRepo.findOneBy({ id });
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

  async markEmailAsConfirmed(email: string) {
    // update 대상자 선택
    return this.userRepo.update(
      { email },
      {
        isEmailConfirm: true,
      },
    );
  }

  async changePassword(email: string, newPassword: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    return this.userRepo.update(
      { email },
      {
        password: hashedPassword,
      },
    );
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    console.log('-----------------------------------');
    const user = await this.findUserById(userId);
    console.log(user);
    const isRefreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    console.log(isRefreshTokenMatch, 'ddddddddddddddddddrs');
    if (isRefreshTokenMatch) return user;
  }
}
