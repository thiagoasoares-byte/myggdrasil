import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../database/entities/event.entity';
import { EventType } from '../database/entities/eventtype.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, EventType])
  ],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule {}
