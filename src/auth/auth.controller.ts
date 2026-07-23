import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDTO } from './dto/login-user.dto';
import { SkipAuth } from '../decorators/publickey';
import type { Request, Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService){}
  
  @SkipAuth()
  @Post('/login')
  @HttpCode(200)
  async loginGet(@Body() dto: UserLoginDTO, @Res({ passthrough: true }) res: Response){
    const auth = await this.AuthService.loginGet(dto)
    // set HttpOnly cookie
    res.cookie('mg_token', auth.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    })
    // return message but not token
    return { message: auth.message }
  }

  @Get('/me')
  async me(@Req() req: Request){
    const payload = (req as any).user
    if(!payload) return { user: null }
    const user = await this.AuthService.getProfile(payload)
    return { user }
  }
  
  @SkipAuth()
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response){
    res.clearCookie('mg_token')
    return { message: 'Logged out' }
  }
}
