import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { UpdatedAndCreatedAtColumn } from "../entityclass/updatedcreatedat.class";
import { EventType } from "./eventtype.entity";

@Entity('event')
export class EventEntity{
  @PrimaryGeneratedColumn({
    type: 'bigint'
  })
  id!: number

  @ManyToOne(()=> UserEntity,(user) => user.events, {nullable:false})
  @JoinColumn({name: 'user_id'})
  user_id!: UserEntity

  @Column({
    type: 'varchar',
    name: 'name',
    length: 255
  })
  name!: string
  
  @ManyToOne(() => EventType, (type)=> type.event, {nullable: false})
  @JoinColumn({name: 'event_type'})
  event_type!: EventType

  @Column({
    type: 'date'
  })
  when?: Date

  @Column({
    type: 'varchar',
    name: 'why',
    length: 128
  })
  why!: string

  @Column({
    type: 'varchar',
    name: 'status',
    length: 100
  })
  status!: string

  @Column(() => UpdatedAndCreatedAtColumn)
    updcreat?: UpdatedAndCreatedAtColumn
}