import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventDTO } from './dto/event.dto';
import { EventEntity } from '../database/entities/event.entity';
import { UserEntity } from '../database/entities/user.entity';
import { AppDataSource } from '../database/data-source';
import { EventTypeDTO } from './dto/eventtype.dto';
import { EventType } from '../database/entities/eventtype.entity';
import { EventUpdateDTO } from './dto/eventupdate.dto';
import { EventTypeUpdateDTO } from './dto/eventtypeupdate.dto';

@Injectable()
export class EventService {

  async getAllEvent(userId: number){
    try{
      const allevents = await AppDataSource.getRepository(EventEntity).createQueryBuilder('event').leftJoinAndSelect('event.user','user').leftJoinAndSelect('event.eventtype','type').where("event.user_id = :id", {user_id : userId}).orderBy('event.when','DESC').getMany()
      
      if(!allevents){
        throw new NotFoundException('O usuário não possuí nenhum evento vinculado')
      }else{
        return allevents
      }
    }catch(error){
      console.log(error) 
    }
  }

  async getEventById(userid: number, id: number){
    try{
      const eventbyid = await AppDataSource.getRepository(EventEntity).createQueryBuilder('event').leftJoinAndSelect('event.user','user').leftJoinAndSelect('event.eventtype','type').where('event.id = :id', {id : id}).andWhere("event.user_id = :userid", {userid : userid}).orderBy('event.when','DESC').getMany()
      
      if(!eventbyid){
        throw new NotFoundException('O usuário não possuí nenhum evento vinculado a esse ID')
      }else{
        return eventbyid
      }
    }catch(error){
      console.log(error) 
    }
  }

  async newEvent(userId: number, dto: EventDTO){
    try{
      const event = new EventEntity()
      event.user_id = {id: userId} as UserEntity
      event.name = dto.name
      event.event_type = dto.event_type
      event.when = dto.when
      event.why = dto.why
      event.status = dto.status

      await AppDataSource.getRepository(EventEntity).save(event)
      return { message: `Evento ID:[${event.id}] foi criado com sucesso!`}
    } catch (error){
    console.log(error)}
  }

  async putEvent(userID:number, id: number, dto: EventDTO){
    try{
      if (!dto || Object.keys(dto).length === 0){
        throw BadRequestException
      } else{
        const valuesToUpdate = Object.fromEntries(
          Object.entries(dto).filter(([_,value])=> value !== undefined )
        )
        await AppDataSource.getRepository(EventEntity).update(
          {id, user_id: {id: userID}},
          valuesToUpdate
        )
        return{ message: 'O evento foi atualizado com sucesso'}
      }
    } catch(error){
      console.log(error)
    }
  }

  async deleteEvent(userId:number, id: number){
    try{
      const repository = await AppDataSource.getRepository(EventEntity)
      const event = await repository.findOne({
        where: {
          id,
          user_id: { id: userId }
        }
      });
      if(!event){
        throw new NotFoundException('Evento não encontrado')
      }
      await repository.delete(id)
      return{message: 'O evento foi deletado com sucesso'}
    }catch(error){
    console.log(error)
    }
  } 
  
  async newEventType(dto: EventTypeDTO){
    try{
      const eventtype = new EventType()
      eventtype.name = dto.name
      await AppDataSource.getRepository(EventType).save(eventtype)
      return { message: `Tipo de evento ID:[${eventtype.id}] foi criado com sucesso!`}
    } catch(error){
      console.log(error)
    }
  }

  async putEventType(id: number, dto: EventTypeDTO){
    try{
      if(!dto || Object.keys(dto).length !== 0){
        throw BadRequestException
      }else{
        const repository = await AppDataSource.getRepository(EventType)
        const event = repository.findOne({where: {id: id}})
        if(!event){
          throw new NotFoundException('Tipo de evento não encontrado.')
        }else{
          repository.update(
            {id:id},
            {name: dto.name}
          )
          return{message: `Tipo de evento ID:[${id}] foi atualizado com sucesso!`}
        }
      }
    }catch(error){
      console.log(error)
    }
  }

  async  deleteEventType(id: number){
    try{
      const repository = await AppDataSource.getRepository(EventType)
      const event = await repository.findOne({where: {id : id}})
      if(!event){
        throw new NotFoundException('O tipo de evento não foi encontrado.')
      }else{
        repository.delete(id)
        return{message: 'O tipo de evento foi deletado com sucesso'}
      }
    }catch(error){
      console.log(error)
    }
  }
}
