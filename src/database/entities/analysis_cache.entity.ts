import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UpdatedAndCreatedAtColumn } from "../entityclass/updatedcreatedat.class";
import { UserEntity } from "./user.entity";

/**
 * Guarda o último resultado da análise por IA de cada usuário, junto com um
 * hash do estado das decisões/relações no momento em que foi gerada. Evita
 * gastar cota da Groq quando nada mudou desde a última análise.
 */
@Entity('analysis_cache')
export class AnalysisCacheEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_id!: UserEntity

  @Column({ type: 'text' })
  result!: string

  @Column({ type: 'varchar', length: '64' })
  decisions_hash!: string

  @Column(() => UpdatedAndCreatedAtColumn, { prefix: '' })
  updcreat?: UpdatedAndCreatedAtColumn
}
