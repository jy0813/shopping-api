import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";

@Entity()
export class User extends BaseEntity {

  @Column()
  public userName: string;

  @Column()
  public email: string;

  @Column()
  public password: string;

  @Column({
    default: false
  })
  public isMarketing: boolean;

  @Column({
    default: false
  })
  public isEvent: boolean;
}
