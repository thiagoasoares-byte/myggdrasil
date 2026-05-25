import {IsEmail, Matches, IsString } from "class-validator"

export class UserLoginDTO {
  @Matches( /^[a-zA-ZÀ-ÿ]+(?:[ .'-][a-zA-ZÀ-ÿ]+)*$/, {message: 'Username must be alphanumeric'} )
  name! : string

  @IsEmail()
  email! : string

  @IsString()
  password! : string
} 