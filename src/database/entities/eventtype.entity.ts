import { Column, Entity, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UpdatedAndCreatedAtColumn } from "../entityclass/updatedcreatedat.class";
import { EventEntity } from "./event.entity";
import { UserEntity } from "./user.entity";

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

  // Dono do tipo de decisão customizado. NULL = tipo padrão, visível para todos.
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_id?: UserEntity | null

  @Column(() => UpdatedAndCreatedAtColumn, { prefix: '' })
  updcreat?: UpdatedAndCreatedAtColumn

  @OneToMany(() => EventEntity, (events) => events.event_type)
  events?: EventEntity[];
}

