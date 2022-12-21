import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { EventDto } from './dto';

@Controller('events')
@ApiTags('events')
@UseGuards(DefaultGuard, RoleGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getEvents' })
  @ApiOkResponse({ type: [EventDto] })
  public async findAll() {
    const events = await this.eventsService.findAll();
    return events.map(event => new EventDto(event));
  }

  @Delete('/:id')
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'deleteEvent' })
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
