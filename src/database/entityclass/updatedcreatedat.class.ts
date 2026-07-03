import { CreateDateColumn, UpdateDateColumn } from "typeorm"

export class UpdatedAndCreatedAtColumn{
  @CreateDateColumn()
  created_at! : Date

  @UpdateDateColumn()
  updated_at! : Date
}

