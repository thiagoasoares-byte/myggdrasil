import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDTO } from './dto/login-user.dto';
import { SkipAuth } from '../decorators/publickey';

@Controller('user')
export class AuthController {
  constructor(private AuthService: AuthService){}
  
  @SkipAuth()
  @Post('/login')
  @HttpCode(200)
  async loginGet(@Body() dto: UserLoginDTO){
    return this.AuthService.loginGet(dto)
  }

  @Get('/profile')
  getprofile(@Request() req){
    return req.user
  }
}
