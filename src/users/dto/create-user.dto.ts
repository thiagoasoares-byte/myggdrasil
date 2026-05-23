import { Type } from "class-transformer"
import { IsDate, IsEmail, IsString, IsStrongPassword } from "class-validator"

export class UserDTO {
  @IsString()
  name! : string

  @IsEmail()
  email! : string

  @IsStrongPassword()
  password! : string

  @IsDate()
  @Type(() => Date)
  birth_dt? : Date
}