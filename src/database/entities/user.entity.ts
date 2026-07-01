import { Column, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { EventEntity } from "./event.entity"
import { UpdatedAndCreatedAtColumn } from "../entityclass/updatedcreatedat.class"

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({
    type: "bigint"
  })
  id! : number

  @Column({
    type: "varchar",
    name: "name",
    length: 100,
    nullable: false
  })
  name! : string

  @Column({
    type: "varchar",
    name: "email",
    length: 255,
    nullable: false
  })
  email! : string

  @Column({
    default: false
  })
  email_verified! : boolean

  @Column({
    type: "varchar",
    name: "password",
    length: 128,
    nullable: false
  })
  password! : string

  @Column({
    type: "date"
  })
  birth_dt? : Date

  @Column(() => UpdatedAndCreatedAtColumn)
  updcreat?: UpdatedAndCreatedAtColumn

  @OneToMany(() => EventEntity, (event) => event.user_id)
  events?: EventEntity[];
} 