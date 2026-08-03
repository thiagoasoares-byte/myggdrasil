import { Injectable, ConflictException, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../database/entities/user.entity';
import { UserCreateDTO } from './dto/create-user.dto';
import { AppDataSource } from '../database/data-source';
import { hashMaker } from '../utils/hash';
import { UserPutDTO } from './dto/put-user.dto';
import { UserDeleteDTO } from './dto/delete-user.dto';
import * as bcrypt from 'bcrypt';
import { EmailTokenEntity } from '../database/entities/email_token.entity';

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
      throw new ConflictException(`Não foi possível fazer o signup`)
    }else{
      // Kafka + envio de e-mail de boas-vindas foram removidos do fluxo de produção
      // (ver docs/kafka-email-removal.md). A conta é criada e liberada direto,
      // sem etapa de verificação por e-mail.
      await userRepository.save(user)
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

  async verifyEmail(token: string): Promise<{ message: string }> {
    const tokenRepository = AppDataSource.getRepository(EmailTokenEntity);
    const userRepository = AppDataSource.getRepository(UserEntity);

    const tokenRecord = await tokenRepository.findOne({
      where: { token },
      relations: ['user_id'],
    });

    if (!tokenRecord) {
      throw new NotFoundException('Token de verificação não encontrado.');
    }

    if (tokenRecord.used_at) {
      throw new BadRequestException('Token já foi utilizado.');
    }

    if (tokenRecord.expires_at < new Date()) {
      throw new BadRequestException('Token expirado.');
    }

    const user = tokenRecord.user_id;
    user.email_verified = true;
    await userRepository.save(user);

    tokenRecord.used_at = new Date();
    await tokenRepository.save(tokenRecord);

    return { message: 'E-mail verificado com sucesso.' };
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
    

 