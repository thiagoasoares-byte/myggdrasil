import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreateDTO } from './dto/create-user.dto';
import { SkipAuth } from '../decorators/publickey';

@Controller()
export class UsersController {
  constructor(private UsersService: UsersService){}
  
  @SkipAuth()
  @Post('/signup')
  @HttpCode(201)
  async signup(@Body() dto: UserCreateDTO){
    return this.UsersService.signupPost(dto)
  }
}
