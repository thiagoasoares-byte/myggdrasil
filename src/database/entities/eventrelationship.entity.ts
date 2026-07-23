import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EventEntity } from './event.entity';
import { UpdatedAndCreatedAtColumn } from '../entityclass/updatedcreatedat.class';

@Entity('eventrelationship')
export class EventRelationshipEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => EventEntity, (event) => event.childRelationships, { nullable: false })
  @JoinColumn({ name: 'parent_id' })
  parent!: EventEntity;

  @ManyToOne(() => EventEntity, (event) => event.parentRelationships, { nullable: false })
  @JoinColumn({ name: 'children_id' })
  child!: EventEntity;

  @Column({ type: 'varchar', name: 'relationship', length: 128, nullable: true })
  relationship?: string;

  @Column(() => UpdatedAndCreatedAtColumn, { prefix: '' })
  updcreat?: UpdatedAndCreatedAtColumn;
}
