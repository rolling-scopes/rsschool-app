import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CurrentRequest, DefaultGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from '../../constants';
import { CourseTasksService } from './course-tasks.service';
import { CourseTaskDto } from './dto';

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
  public async getOne(@Param('courseId', ParseIntPipe) courseId: number) {
    const data = await this.courseTasksService.getAll(courseId);
    return data.map(item => new CourseTaskDto(item));
  }
}
