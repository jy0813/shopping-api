import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { CreateUserDto } from "../user/dto/create-user.dto";
import * as bcrypt from 'bcryptjs'
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class AuthService {

  constructor(
    // import해서 userService를 읽기전용으로 가져온다.
    private readonly userService: UserService,
    // 토큰 생성및 조회에 사용
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async createUserByEmail(creatUserDto: CreateUserDto) {
    const newUser = await this.userService.createUser(creatUserDto);
    // password는 undefined로 한다.(노출 x)
    newUser.password = undefined;
    return newUser;
  }


  // 로그인 함수
  // 이메일 체크, 비밀번호 매칭, jwt 리턴
  async getAuthenticatedUser(email: string, password: string) {
    try {
      // 이메일 체크
      const user = await this.userService.findUserByEmail(email);

      // password 체크 값 비교
      const isMatching = await bcrypt.compare(password, user.password);
      if (!isMatching) {
        throw new HttpException('Password do Not Match', HttpStatus.CONFLICT);
      }
      user.password = undefined;
      return user;
    }
    catch (err) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  public generateAccessToken(userId: string) {
    const payload = {userId}
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESSTOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESSTOKEN_EXPIRATION_TIME',
      )}s`,
    });
    return token;
  }
}
