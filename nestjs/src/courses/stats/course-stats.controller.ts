import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CurrentRequest, DefaultGuard } from '../../auth';
import { ONE_HOUR_CACHE_TTL } from '../../constants';
import { CourseAccessService } from '../course-access.service';
import { CourseStatsService } from './course-stats.service';
import { CourseStatsDto, CountriesStatsDto, CourseMentorsStatsDto, TaskPerformanceStatsDto } from './dto';

@Controller('courses/:courseId/stats')
@ApiTags('course stats')
@UseGuards(DefaultGuard)
export class CourseStatsController {
  constructor(
    private courseStatsService: CourseStatsService,
    private courseAccessService: CourseAccessService,
  ) {}

  @Get('/')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ operationId: 'getCourseStats' })
  @ApiOkResponse({ type: CourseStatsDto })
  public async getCourses(@Req() req: CurrentRequest, @Param('courseId', ParseIntPipe) courseId: number) {
    if (!this.courseAccessService.canAccessCourse(req.user, courseId)) {
      throw new ForbiddenException();
    }
    const data = await this.courseStatsService.getStudents(courseId);
    return new CourseStatsDto(data);
  }

  @Get('/mentors')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getCourseMentors' })
  @ApiOkResponse({ type: CourseMentorsStatsDto })
  @ApiBadRequestResponse()
  public async getMentors(@Param('courseId', ParseIntPipe) courseId: number) {
    const data = await this.courseStatsService.getMentors(courseId);
    return new CourseMentorsStatsDto(data);
  }

  @Get('/mentors/countries')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getCourseMentorCountries' })
  @ApiOkResponse({ type: CountriesStatsDto })
  @ApiBadRequestResponse()
  public async getMentorCountries(@Param('courseId', ParseIntPipe) courseId: number): Promise<CountriesStatsDto> {
    const data = await this.courseStatsService.getMentorCountries(courseId);
    return data;
  }

  @Get('/students/countries')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getCourseStudentCountries' })
  @ApiOkResponse({ type: CountriesStatsDto })
  @ApiBadRequestResponse()
  public async getStudentCountries(@Param('courseId', ParseIntPipe) courseId: number): Promise<CountriesStatsDto> {
    const data = await this.courseStatsService.getStudentCountries(courseId);
    return data;
  }

  @Get('/task/:taskId/performance')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getTaskPerformance' })
  @ApiOkResponse({ type: TaskPerformanceStatsDto })
  @ApiBadRequestResponse()
  public async getTaskPerformance(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    const stats = await this.courseStatsService.getTaskPerformance(taskId);
    return new TaskPerformanceStatsDto(stats);
  }
}
