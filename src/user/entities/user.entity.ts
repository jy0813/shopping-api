import { BeforeInsert, Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity';
import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
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

  // @Column()
  // public tempNumber: number;

  //db에 넣기 직전에 실행되는 함수 암호
  @BeforeInsert()
  async hashPassword() {
    try {
      const salt = await bcrypt.genSalt(10);
      // 위에 있는 password 를 bcrypt 를 통하여 hash 하겠다.
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
