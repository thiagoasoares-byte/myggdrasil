import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
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

  @CreateDateColumn()
  created_at! : Date

  @UpdateDateColumn()
  updated_at! : Date
} 