import { Injectable, ConflictException} from '@nestjs/common';
import { UserEntity } from '../database/entities/user.entity';
import { UserCreateDTO } from './dto/create-user.dto';
import { AppDataSource } from '../database/data-source';
import { hashMaker } from '../utils/hash';

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
} 
    

 