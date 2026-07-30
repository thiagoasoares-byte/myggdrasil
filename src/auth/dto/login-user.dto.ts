import {IsEmail, Matches, IsString, IsOptional } from "class-validator"

export class UserLoginDTO {
  @IsOptional()
  @Matches( /^[a-zA-ZÀ-ÿ]+(?:[ .'-][a-zA-ZÀ-ÿ]+)*$/, {message: 'Username must be alphanumeric'} )
  name? : string

  @IsEmail()
  email! : string

  @IsString()
  password! : string
}  