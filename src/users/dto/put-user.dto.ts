import { Type } from "class-transformer"
import { IsDate, IsEmail, Matches, IsOptional } from "class-validator"

export class UserPutDTO {
  @IsOptional()
  @Matches( /^[a-zA-ZÀ-ÿ]+(?:[ .'-][a-zA-ZÀ-ÿ]+)*$/, {message: 'Username must be alphanumeric'} )
  name? : string

  @IsOptional()
  @IsEmail()
  email? : string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birth_dt? : Date
} 