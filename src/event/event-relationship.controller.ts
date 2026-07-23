import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EventRelationshipService } from './event-relationship.service';

@Controller('event')
export class EventRelationshipController {
  constructor(private readonly relService: EventRelationshipService) {}

  @Post('relationship')
  async create(@Body() body: { parentId: number; childId: number; relationship?: string }) {
    const { parentId, childId, relationship } = body;
    return this.relService.createRelation(parentId, childId, relationship);
  }

  @Get(':id/relationships')
  async list(@Param('id', ParseIntPipe) id: number) {
    return this.relService.getRelationsForEvent(id);
  }

  @Delete('relationship/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.relService.deleteRelation(id);
  }
}
