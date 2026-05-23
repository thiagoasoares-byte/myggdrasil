import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDTO } from './dto/create-user.dto';

@Controller('/signup')
export class UsersController {
  constructor(private UsersService: UsersService){}
  
  @Post()
  @HttpCode(201)
  async signup(@Body() dto: UserDTO){
    return this.UsersService.signupPost(dto)
  } 
}
