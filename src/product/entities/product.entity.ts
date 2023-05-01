import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";

@Entity()
export class Product extends BaseEntity {
  @Column()
  public name: string;

  @Column()
  public price: number;

  @Column()
  public countInStock: number;
}
