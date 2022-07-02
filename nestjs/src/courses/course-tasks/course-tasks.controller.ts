import { CourseTask } from '@entities/courseTask';
import {
  Body,
  CacheInterceptor,
  CacheTTL,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CourseGuard, CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from '../../constants';
import { CourseTasksService, Status } from './course-tasks.service';
import { CourseTaskDto, CourseTaskDetailedDto } from './dto';
import { CreateCourseTaskDto } from './dto/create-course-task.dto';
import { UpdateCourseTaskDto } from './dto/update-course-task.dto';

@Controller('courses/:courseId/tasks')
@ApiTags('courses tasks')
@UseGuards(DefaultGuard, RoleGuard)
export class CourseTasksController {
  constructor(private courseTasksService: CourseTasksService) {}

  @Get()
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({ type: [CourseTaskDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getCourseTasks' })
  @ApiQuery({ name: 'status', enum: ['started', 'inprogress', 'finished'], required: false })
  @UseGuards(CourseGuard)
  public async getAll(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('status') status?: Status,
  ): Promise<CourseTaskDto[]> {
    const data = await this.courseTasksService.getAll(courseId, status);
    return data.map(item => new CourseTaskDto(item));
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

  @Delete('/:courseEventId')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiParam({ name: 'courseId' })
  @ApiOperation({ operationId: 'deleteCourseTask' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async deleteCourseTask(@Param('courseEventId', ParseIntPipe) courseEventId: number) {
    await this.courseTasksService.disable(courseEventId);
  }
}
