import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CourseGuard, DefaultGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from '../../constants';
import { CourseTasksService, Status } from './course-tasks.service';
import { CourseTaskDto, CourseTaskDetailedDto } from './dto';

@Controller('courses/:courseId/tasks')
@ApiTags('courses tasks')
@UseGuards(DefaultGuard, CourseGuard)
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
  @ApiOperation({ operationId: 'getCourseTask' })
  public async getById(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ): Promise<CourseTaskDetailedDto> {
    const data = await this.courseTasksService.getById(courseTaskId);
    return new CourseTaskDetailedDto(data);
  }
}
