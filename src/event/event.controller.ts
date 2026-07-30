import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Request } from '@nestjs/common';
import { EventService } from './event.service';
import { EventDTO } from './dto/event.dto';
import { EventTypeDTO } from './dto/eventtype.dto';
import { EventTypeUpdateDTO } from './dto/eventtypeupdate.dto';

@Controller()
export class EventController {
  constructor(private EventService: EventService){}

  @Get('events/:id')
  async getEventById(@Param('id', ParseIntPipe) id: number, @Request() req){
    const userId = req.user.sub
    return this.EventService.getEventById(userId, id)
  }

  @Get('events')
  async getAllEvent(@Request() req){
    const userId = req.user.sub
    return this.EventService.getAllEvent(userId)
  }

  @Post('events')
  async newEvent(@Request() req,@Body() dto: EventDTO){
    const userID = req.user.sub
    return this.EventService.newEvent(userID, dto)
  }
  
  @Put('events/:id')
  async putEvent(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() dto: EventDTO){
    const userId = req.user.sub
    return this.EventService.putEvent(userId, id, dto)
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id', ParseIntPipe) id: number, @Request() req){
    const userId = req.user.sub
    return this.EventService.deleteEvent(userId,id)
  }

  @Post('event-types')
  async newEventType(@Body() dto: EventTypeDTO){
    return this.EventService.newEventType(dto)
  }

  @Put('event-types/:id')
  async putEventType(@Param('id', ParseIntPipe) id: number, @Body() dto: EventTypeUpdateDTO){
    return this.EventService.putEventType(id, dto)
  }

  @Delete('event-types/:id')
  async deleteEventType(@Param('id', ParseIntPipe) id: number){
    return this.EventService.deleteEventType(id)
  }
}
