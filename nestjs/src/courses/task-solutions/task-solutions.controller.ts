import { BadRequestException, Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, RoleGuard } from '../../auth';
import { TaskSolutionsService } from './task-solutions.service';
import { SaveTaskSolutionDto, TaskSolutionDto } from './dto';

@Controller('courses/:courseId/tasks/:courseTaskId/solutions')
@ApiTags('courses task solutions')
export class TaskSolutionsController {
  constructor(private taskSolutionsService: TaskSolutionsService) {}

  @Post('/')
  @ApiOkResponse({ type: TaskSolutionDto })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'createTaskSolution' })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Student])
  public async createTaskSolution(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Body() dto: SaveTaskSolutionDto,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    if (!studentId) {
      throw new BadRequestException('You are not a student in this course');
    }
    const result = await this.taskSolutionsService.saveTaskSolution(courseTaskId, studentId, dto);

    return new TaskSolutionDto(result);
  }
}
