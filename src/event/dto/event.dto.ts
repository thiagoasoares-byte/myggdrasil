import { IsDate, IsNumber, IsString } from "class-validator";
import { Type } from 'class-transformer'
import { EventType } from "../../database/entities/eventtype.entity";

export class EventDTO{
  @IsString()
  name!: string

  @IsNumber()
  event_type!: EventType

  @IsDate()
  @Type(() => Date)
  when!: Date

  @IsString()
  why!: string

  @IsString()
  status!: string
}