import { Injectable, ConflictException, BadRequestException, UnauthorizedException, NotFoundException} from '@nestjs/common';
import { UserEntity } from '../database/entities/user.entity';
import { UserCreateDTO } from './dto/create-user.dto';
import { AppDataSource } from '../database/data-source';
import { hashMaker } from '../utils/hash';
import { UserPutDTO } from './dto/put-user.dto';
import { UserDeleteDTO } from './dto/delete-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async signupPost(dto : UserCreateDTO ): Promise<{message:any}> {
    const user = new UserEntity()
    user.name = dto.name
    user.email = dto.email
    user.password = await hashMaker(dto.password)
    user.birth_dt = dto.birth_dt 

    const userRepository = AppDataSource.getRepository(UserEntity)
    if(await userRepository.findOne({where : { email: dto.email }})){
      throw new ConflictException(`O e-mail ${dto.email} já está sendo utilizado.`)
    }else{
      await userRepository.save(user)
      return { message: `Usuário ID:[${user.id}] foi criado com sucesso!`}
  }}

  async putUser(request : UserPutDTO, userId : number): Promise<{message:any}>{
    if(!request || Object.keys(request).length === 0){
      throw new BadRequestException()
    } else{
      const fieldstToUpdate = Object.fromEntries(
        Object.entries(request).filter(([_, value]) => value !== undefined)
      )
      await AppDataSource.getRepository(UserEntity).update(
        {id: userId},
        fieldstToUpdate
      )
    }
    return{ message: 'O usuário foi atualizado com sucesso'}
  }

  async deleteUser(senhaUser: UserDeleteDTO,userId: number): Promise<{message:any}>{
    console.log('userId:', userId)
    let userReturn: UserEntity
    try{
      userReturn = await AppDataSource.getRepository(UserEntity).createQueryBuilder('user').where('user.id = :id',{id: userId}).getOneOrFail()
      if(await bcrypt.compare(senhaUser.password, userReturn.password)){
        await AppDataSource.getRepository(UserEntity).createQueryBuilder('user').where('user.id = :id',{id: userId}).delete().execute()
      }else {
        throw new UnauthorizedException('Senhas não coincidem')
      }
    } catch(e){
        if (e instanceof UnauthorizedException){
          throw e
        } throw new NotFoundException('Usuário não encontrado')
      }
    return{ message: 'O usuário foi deletado com sucesso'}
  }
} 
    

 