import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserLoginDTO } from './dto/login-user.dto';
import { UserEntity } from '../database/entities/user.entity';
import { AuthResponse } from './interface/authresponse';
import { AppDataSource } from '../database/data-source';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ){}

  async loginGet(dto: UserLoginDTO): Promise<AuthResponse>{
    let userReturn: UserEntity | null
    try{
      userReturn = await AppDataSource.getRepository(UserEntity).createQueryBuilder('user').where('user.email = :email',{email: dto.email}).getOneOrFail()
    } catch(e){
      throw new UnauthorizedException('Credenciais inválidas')
    } 
    if(await bcrypt.compare(dto.password, userReturn.password)){
      const payload = { sub: userReturn.id, username: userReturn.name, email: userReturn.email }
      return{
        accessToken: `${await this.jwtService.signAsync(payload)}`,
        message: `O login foi feito com sucesso.`}
    }else{
      throw new UnauthorizedException('Credenciais inválidas')
    } 
  }

  async getProfile(payload: any){
    try{
      const user = await AppDataSource.getRepository(UserEntity).findOneBy({ id: payload.sub })
      if(!user) return null
      // remove sensitive fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user as any
      return rest
    }catch(e){
      return null
    }
  }
}
