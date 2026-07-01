import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Request } from '@nestjs/common';
import { EventService } from './event.service';
import { EventDTO } from './dto/event.dto';
import { EventUpdateDTO } from './dto/eventupdate.dto';
import { EventTypeDTO } from './dto/eventtype.dto';
import { EventTypeUpdateDTO } from './dto/eventtypeupdate.dto';

@Controller('event')
export class EventController {
  constructor(private EventService: EventService){}

  @Get('/event/:id')
  async getEventById(@Param('id', ParseIntPipe) id: number, @Request() req){
    const userId = req.user.sub
    return this.EventService.getEventById(userId, id)
  }

  @Get('/event')
  async getAllEvent(@Request() req){
    const userId = req.user.sub
    return this.EventService.getAllEvent(userId)
  }

  @Post('/event/create')
  async newEvent(@Request() req,@Body() dto: EventDTO){
    const userID = req.user.sub
    return this.EventService.newEvent(userID, dto)
  }
  
  @Put('/event/update/:id')
  async putEvent(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() dto: EventDTO){
    const userId = req.user.sub
    return this.EventService.putEvent(userId, id, dto)
  }

  @Delete('/event/delete/:id')
  async deleteEvent(@Param('id', ParseIntPipe) id: number, @Request() req){
    const userId = req.user.sub
    return this.EventService.deleteEvent(userId,id)
  }

  @Post('/event&type/create')
  async newEventType(@Body() dto: EventTypeDTO){
    return this.EventService.newEventType(dto)
  }

  @Put('/event&type/update/:id')
  async putEventType(@Param('id', ParseIntPipe) id: number, @Body() dto: EventTypeUpdateDTO){
    return this.EventService.putEventType(id, dto)
  }

  @Delete('/event&type/delete/:id')
  async deleteEventType(@Param('id', ParseIntPipe) id: number){
    return this.EventService.deleteEventType(id)
  }
}
