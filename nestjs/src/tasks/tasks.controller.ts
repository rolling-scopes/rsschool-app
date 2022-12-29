import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskDto } from './dto';

@Controller('tasks')
@ApiTags('tasks')
@UseGuards(DefaultGuard, RoleGuard)
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post('/')
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'createTask' })
  @ApiOkResponse({ type: TaskDto })
  public async create(@Body() dto: CreateTaskDto) {
    const data = await this.service.create(dto);
    return new TaskDto(data);
  }

  @Get('/')
  @ApiOperation({ operationId: 'getTasks' })
  @ApiOkResponse({ type: [TaskDto] })
  public async getAll() {
    const items = await this.service.getAll();
    return items.map(item => new TaskDto(item));
  }

  @Delete('/:id')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'deleteTask' })
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Patch('/:id')
  @RequiredRoles([CourseRole.Manager])
  @ApiOperation({ operationId: 'updateTask' })
  @ApiOkResponse({ type: TaskDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    const data = await this.service.update(id, dto);
    return new TaskDto(data);
  }
}
