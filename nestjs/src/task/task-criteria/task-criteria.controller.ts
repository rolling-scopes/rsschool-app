import { Controller, Get, Body, Patch, Param, UseGuards, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TaskCriteriaService } from './task-criteria.service';
import { TaskCriteriaDto } from './dto/task-criteria.dto';
import { DefaultGuard, RoleGuard } from '../../auth';

@Controller('task/:taskId/criteria')
@ApiTags('criteria')
@UseGuards(DefaultGuard, RoleGuard)
export class TaskCriteriaController {
  constructor(private readonly taskCriteriaService: TaskCriteriaService) {}

  @Get()
  @ApiOperation({ operationId: 'getTaskCriteria' })
  @ApiOkResponse({ type: TaskCriteriaDto })
  async get(@Param('taskId') taskId: number) {
    return this.taskCriteriaService.getCriteria(taskId);
  }

  @Post()
  @ApiOperation({ operationId: 'createTaskCriteria' })
  @ApiOkResponse({ type: TaskCriteriaDto })
  @ApiBody({ type: TaskCriteriaDto })
  create(@Param('taskId') taskId: number, @Body() taskCriteriaDto: TaskCriteriaDto) {
    return this.taskCriteriaService.createCriteria(taskId, taskCriteriaDto.criteria);
  }

  @Patch()
  @ApiOperation({ operationId: 'updateTaskCriteria' })
  @ApiOkResponse({ type: TaskCriteriaDto })
  @ApiBody({ type: TaskCriteriaDto })
  update(@Param('taskId') taskId: number, @Body() taskCriteriaDto: TaskCriteriaDto) {
    return this.taskCriteriaService.updateCriteria(taskId, taskCriteriaDto);
  }
}
