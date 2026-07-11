import { Injectable, ConflictException, BadRequestException, UnauthorizedException, NotFoundException, Inject, ParseUUIDPipe} from '@nestjs/common';
import { UserEntity } from '../database/entities/user.entity';
import { UserCreateDTO } from './dto/create-user.dto';
import { AppDataSource } from '../database/data-source';
import { hashMaker } from '../utils/hash';
import { UserPutDTO } from './dto/put-user.dto';
import { UserDeleteDTO } from './dto/delete-user.dto';
import * as bcrypt from 'bcrypt';
import { ClientKafka } from '@nestjs/microservices';
import { EmailTokenEntity } from '../database/entities/email_token.entity';
import { UUID } from 'typeorm/driver/mongodb/bson.typings.js';
import { randomUUID } from 'crypto';
import { error } from 'console';

@Injectable()
export class UsersService {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka
  ) {}

  async signupPost(dto : UserCreateDTO ): Promise<{message:any}> {
    const user = new UserEntity()
    user.name = dto.name
    user.email = dto.email
    user.password = await hashMaker(dto.password)
    user.birth_dt = dto.birth_dt 

    const userRepository = AppDataSource.getRepository(UserEntity)
    if(await userRepository.findOne({where : { email: dto.email }})){
      throw new ConflictException(`Não foi possível fazer o signup`)
    }else{
      const token = randomUUID()
      await userRepository.save(user)

      const emailtoken = new EmailTokenEntity()
      emailtoken.user_id = user
      emailtoken.token = await hashMaker(token)
      emailtoken.expires_at = new Date(Date.now() + 86400000)
      await AppDataSource.getRepository(EmailTokenEntity).save(emailtoken)

      await this.kafkaClient.emit('user.signup',{
        email: dto.email,
        name: dto.name,
        token: token
      })
      return { message: `Usuário foi criado com sucesso!`}
    }
  }

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
    

 