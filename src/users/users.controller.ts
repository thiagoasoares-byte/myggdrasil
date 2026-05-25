import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreateDTO } from './dto/create-user.dto';

@Controller()
export class UsersController {
  constructor(private UsersService: UsersService){}
  
  @Post('/signup')
  @HttpCode(201)
  async signup(@Body() dto: UserCreateDTO){
    return this.UsersService.signupPost(dto)
  }
}
