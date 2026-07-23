import { Body, Controller, Get, Post, Delete, HttpCode, Put, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreateDTO } from './dto/create-user.dto';
import { SkipAuth } from '../decorators/publickey';
import { UserPutDTO } from './dto/put-user.dto';
import { UserDeleteDTO } from './dto/delete-user.dto';

@Controller('user')
export class UsersController {
  constructor(private UsersService: UsersService){}
  
  @SkipAuth()
  @Post('/signup') 
  @HttpCode(201)
  async signup(@Body() dto: UserCreateDTO){
    return this.UsersService.signupPost(dto)
  }

  @Get('/profile')
  getprofile(@Request() req){
    return req.user
  }

  @Put('/profile/update')
  @HttpCode(200)
  async putuser(@Body() dto: UserPutDTO, @Req() req:any){
    const userId = req.user.sub
    return this.UsersService.putUser(dto, userId)
  }

  @Delete('/profile/delete')
  @HttpCode(200)
  async deleteuser(@Body() dto: UserDeleteDTO, @Req() req:any){
    const userId = req.user.sub
    return this.UsersService.deleteUser(dto, userId)
  }

  @SkipAuth()
  @Post('/verify-email')
  @HttpCode(200)
  async verifyEmail(@Body('token') token: string) {
    return this.UsersService.verifyEmail(token);
  }
}
