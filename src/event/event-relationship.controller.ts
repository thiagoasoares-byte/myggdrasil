import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EventRelationshipService } from './event-relationship.service';

@Controller()
export class EventRelationshipController {
  constructor(private readonly relService: EventRelationshipService) {}

  @Post('event-relationships')
  async create(@Body() body: { parentId: number; childId: number; relationship?: string }) {
    const { parentId, childId, relationship } = body;
    return this.relService.createRelation(parentId, childId, relationship);
  }

  @Get('events/:id/relationships')
  async list(@Param('id', ParseIntPipe) id: number) {
    return this.relService.getRelationsForEvent(id);
  }

  @Delete('event-relationships/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.relService.deleteRelation(id);
  }
}
