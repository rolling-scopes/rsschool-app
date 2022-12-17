import { CourseTask } from '@entities/courseTask';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { CourseTasksService, Status } from './course-tasks.service';
import { CourseTaskDetailedDto, CourseTaskDto } from './dto';
import { CreateCourseTaskDto } from './dto/create-course-task.dto';
import { UpdateCourseTaskDto } from './dto/update-course-task.dto';

@Controller('courses/:courseId/tasks')
@ApiTags('courses tasks')
@UseGuards(DefaultGuard, RoleGuard)
export class CourseTasksController {
  constructor(private courseTasksService: CourseTasksService) {}

  @Get()
  @ApiOkResponse({ type: [CourseTaskDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getCourseTasks' })
  @ApiQuery({ name: 'status', enum: ['started', 'inprogress', 'finished'], required: false })
  @UseGuards(CourseGuard)
  public async getAll(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('status') status?: Status,
  ): Promise<CourseTaskDto[]> {
    const isStudent = !!req.user.courses[courseId]?.studentId;
    const data = await this.courseTasksService.getAll(courseId, status, isStudent);
    return data.map(item => new CourseTaskDto(item));
  }

  @Get('/detailed')
  @ApiOkResponse({ type: [CourseTaskDetailedDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getCourseTasksDetailed' })
  @UseGuards(CourseGuard)
  public async getAllExtended(
    @Req() _: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<CourseTaskDto[]> {
    const data = await this.courseTasksService.getAllDetailed(courseId);
    return data.map(item => new CourseTaskDetailedDto(item));
  }

  @Get('/:courseTaskId')
  @ApiOkResponse({ type: CourseTaskDetailedDto })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @UseGuards(CourseGuard)
  @ApiOperation({ operationId: 'getCourseTask' })
  public async getById(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ): Promise<CourseTaskDetailedDto> {
    const data = await this.courseTasksService.getById(courseTaskId);
    return new CourseTaskDetailedDto(data);
  }

  @Post('/')
  @ApiOkResponse({ type: CourseTaskDetailedDto })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'createCourseTask' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async createCourseTask(@Param('courseId', ParseIntPipe) courseId: number, @Body() dto: CreateCourseTaskDto) {
    await this.courseTasksService.createCourseTask({
      ...(dto as CourseTask),
      courseId,
    });
  }

  @Put('/:courseTaskId')
  @ApiOkResponse({ type: CourseTaskDetailedDto })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'updateCourseTask' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async updateCourseTask(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Body() dto: UpdateCourseTaskDto,
  ) {
    await this.courseTasksService.updateCourseTask(courseTaskId, {
      ...dto,
      courseId,
      id: courseTaskId,
    } as Partial<CourseTask>);
  }

  @Delete('/:courseTaskId')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'deleteCourseTask' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async deleteCourseTask(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {
    await this.courseTasksService.disable(courseTaskId);
  }
}
