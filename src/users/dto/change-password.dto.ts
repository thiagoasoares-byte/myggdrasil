import { IsStrongPassword, IsString, MinLength } from "class-validator"

export class ChangePasswordDTO {
  @IsString()
  @MinLength(1)
  currentPassword!: string

  @IsStrongPassword()
  newPassword!: string
}
