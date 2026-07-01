import {IsNumber, IsString } from "class-validator";

export class EventTypeUpdateDTO{
  @IsNumber()
  id!: number

  @IsString()
  name!: string
}