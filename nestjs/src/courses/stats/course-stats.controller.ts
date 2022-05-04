import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../../auth';
import { ONE_HOUR_CACHE_TTL } from '../../constants';
import { CourseAccessService } from '../course-access.service';
import { CourseStatsService } from './course-stats.service';
import { CourseStatsDto } from './dto';

@Controller('courses/:courseId/stats')
@ApiTags('course stats')
@UseGuards(DefaultGuard)
export class CourseStatsController {
  constructor(private courseStatsService: CourseStatsService, private courseAccessService: CourseAccessService) {}

  @Get('/')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ operationId: 'getCourseStats' })
  @ApiOkResponse({ type: [CourseStatsDto] })
  public async getCourses(@Req() req: CurrentRequest, @Param('courseId', ParseIntPipe) courseId: number) {
    if (!this.courseAccessService.canAccessCourse(req.user, courseId)) {
      throw new ForbiddenException();
    }
    const data = await this.courseStatsService.getById(courseId);
    return new CourseStatsDto(data);
  }
}
