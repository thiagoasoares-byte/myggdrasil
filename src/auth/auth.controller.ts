import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDTO } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService){}
    
  @Post('/login')
  @HttpCode(200)
  async loginGet(@Body() dto: UserLoginDTO){
    return this.AuthService.loginGet(dto)
  }
}
