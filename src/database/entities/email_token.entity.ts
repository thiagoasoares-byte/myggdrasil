import { Column, Entity, ForeignKey, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { UpdatedAndCreatedAtColumn } from "../entityclass/updatedcreatedat.class";

@Entity('email_token')
export class EmailTokenEntity{
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id'
  })
  id!: number

  @ManyToOne(()=> UserEntity,(user) => user.emailtoken, {nullable:false})
  @JoinColumn({name: 'user_id'})
  user_id!: UserEntity
  
  @Column({
    type: "varchar",
    length: 256,
    name: 'token'
  })
  token!: string
  
  @Column({
    type: 'timestamp',
    name: 'expires_at'
  })
  expires_at!: Date

  @Column({
    type: 'timestamp',
    name: 'used_at'
  })
  used_at!: Date

  @Column(() => UpdatedAndCreatedAtColumn, { prefix: '' })
    updcreat?: UpdatedAndCreatedAtColumn
}
