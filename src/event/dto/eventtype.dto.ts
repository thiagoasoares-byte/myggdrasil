import {IsString } from "class-validator";

export class EventTypeDTO{
  @IsString()
  name!: string
}