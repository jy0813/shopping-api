import { BeforeInsert, Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { Provider } from './provider.enum';
import { RoleEnum } from './role.enum';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User extends BaseEntity {
  @Column()
  public userName: string;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  @Exclude()
  public password?: string;

  @Column({
    default: false,
  })
  public isMarketing: boolean;

  @Column({
    default: false,
  })
  public isEvent: boolean;

  @Column({
    default: false,
  })
  public isEmailConfirm: boolean;

  // 임시용 redis 작업 시 걷어낼거
  @Column({ nullable: true })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.LOCAL,
  })
  public provider: Provider;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    array: true,
    default: [RoleEnum.USER],
  })
  public roles: RoleEnum[];

  // @Column()
  // public tempNumber: number;

  //db에 넣기 직전에 실행되는 함수 암호
  @BeforeInsert()
  async hashPassword() {
    try {
      if (this.provider !== Provider.LOCAL) {
        return;
      } else {
        const salt = await bcrypt.genSalt(10);
        // 위에 있는 password 를 bcrypt 를 통하여 hash 하겠다.
        this.password = await bcrypt.hash(this.password, salt);
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
