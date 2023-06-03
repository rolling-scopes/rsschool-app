import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { CreateEventDto, EventDto, UpdateEventDto } from './dto';

@Controller('events')
@ApiTags('events')
@UseGuards(DefaultGuard, RoleGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getEvents' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOkResponse({ type: [EventDto] })
  public async findAll() {
    const events = await this.eventsService.findAll();
    return events.map(event => new EventDto(event));
  }

  @Post('/')
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'createEvent' })
  @ApiOkResponse({ type: EventDto })
  public async create(@Body() dto: CreateEventDto) {
    const data = await this.eventsService.create(dto);
    return new EventDto(data);
  }

  @Patch('/:id')
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'updateEvent' })
  @ApiOkResponse({ type: EventDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    const data = await this.eventsService.update(id, dto);
    return new EventDto(data);
  }

  @Delete('/:id')
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'deleteEvent' })
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
