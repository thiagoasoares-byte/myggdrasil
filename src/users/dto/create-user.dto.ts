import { Type } from "class-transformer"
import { IsDate, IsEmail, Matches, IsStrongPassword, IsOptional } from "class-validator"

export class UserCreateDTO {
  @Matches( /^[a-zA-ZÀ-ÿ]+(?:[ .'-][a-zA-ZÀ-ÿ]+)*$/, {message: 'Username must be alphanumeric'} )
  name! : string

  @IsEmail()
  email! : string

  @IsStrongPassword()
  password! : string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birth_dt? : Date
} 