import { Controller, Get, Body, Patch, Param, UseGuards, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TasksCriteriaService } from './tasks-criteria.service';
import { TaskCriteriaDto } from './dto/task-criteria.dto';
import { DefaultGuard, RoleGuard, RequiredRoles, Role, CourseRole } from '../../auth';

@Controller('tasks/:taskId/criteria')
@ApiTags('tasks-criteria')
@UseGuards(DefaultGuard, RoleGuard)
export class TasksCriteriaController {
  constructor(private readonly taskCriteriaService: TasksCriteriaService) {}

  @Get()
  @ApiOperation({ operationId: 'getTaskCriteria' })
  @ApiOkResponse({ type: TaskCriteriaDto })
  async get(@Param('taskId') taskId: number) {
    const data = await this.taskCriteriaService.getCriteria(taskId);
    return data;
  }

  @Post()
  @ApiOperation({ operationId: 'createTaskCriteria' })
  @ApiOkResponse({ type: TaskCriteriaDto })
  @ApiBody({ type: TaskCriteriaDto })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  async create(@Param('taskId') taskId: number, @Body() taskCriteriaDto: TaskCriteriaDto) {
    const data = await this.taskCriteriaService.createCriteria(taskId, taskCriteriaDto.criteria);
    return data;
  }

  @Patch()
  @ApiOperation({ operationId: 'updateTaskCriteria' })
  @ApiOkResponse({ type: TaskCriteriaDto })
  @ApiBody({ type: TaskCriteriaDto })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  async update(@Param('taskId') taskId: number, @Body() taskCriteriaDto: TaskCriteriaDto) {
    const data = await this.taskCriteriaService.updateCriteria(taskId, taskCriteriaDto);
    return data;
  }
}
