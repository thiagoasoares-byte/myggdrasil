import { IsDate, IsNumber, IsString } from "class-validator";
import { EventType } from "../../database/entities/eventtype.entity";

export class EventDTO{
  @IsString()
  name!: string

  @IsNumber()
  event_type!: EventType

  @IsDate()
  when!: Date

  @IsString()
  why!: string

  @IsString()
  status!: string
}