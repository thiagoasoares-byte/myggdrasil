import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UpdatedAndCreatedAtColumn } from "../entityclass/updatedcreatedat.class";
import { EventEntity } from "./event.entity";

@Entity('eventtype')
export class EventType{
  @PrimaryGeneratedColumn({
    type: 'bigint'
  })
  id!: number

  @Column({
    type: 'varchar',
    name: 'name',
    length: '100',
    nullable: false
  })
  name!: string

  @Column({
      default: false
    })
    is_default!: boolean

  @Column(() => UpdatedAndCreatedAtColumn)
  updcreat?: UpdatedAndCreatedAtColumn

  @OneToMany(() => EventEntity,(events) => events.event_type)
  event?: EventType[]
}
