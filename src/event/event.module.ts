import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRelationshipController } from './event-relationship.controller';
import { EventRelationshipService } from './event-relationship.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../database/entities/event.entity';
import { EventType } from '../database/entities/eventtype.entity';
import { EventRelationshipEntity } from '../database/entities/eventrelationship.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, EventType, EventRelationshipEntity])
  ],
  controllers: [EventController, EventRelationshipController],
  providers: [EventService, EventRelationshipService]
})
export class EventModule {}
