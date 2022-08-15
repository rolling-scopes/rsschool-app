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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CurrentRequest, DefaultGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from '../../constants';
import { CourseScheduleItemDto } from './dto';
import { CourseScheduleService } from './course-schedule.service';

@Controller('courses/:courseId/schedule')
@ApiTags('courses schedule')
export class CourseScheduleController {
  constructor(private courseTasksService: CourseScheduleService) {}

  @Get()
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({ type: [CourseScheduleItemDto] })
  @ApiOperation({ operationId: 'getSchedule' })
  @UseGuards(DefaultGuard, CourseGuard)
  public async getAll(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<CourseScheduleItemDto[]> {
    const studentId = req.user.courses[courseId]?.studentId ?? undefined;
    const data = await this.courseTasksService.getAll(courseId, studentId);
    return data.map(item => new CourseScheduleItemDto(item));
  }
}
