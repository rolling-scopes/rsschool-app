import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { ONE_HOUR_CACHE_TTL } from '../../constants';
import { CourseAccessService } from '../course-access.service';
import { CourseStatsService } from './course-stats.service';
import {
  CourseStatsDto,
  CountriesStatsDto,
  CourseMentorsStatsDto,
  TaskPerformanceStatsDto,
  CourseAggregateStatsDto,
} from './dto';
import { ExpelledStatsService } from '../expelled-stats.service';
import { CourseRole } from '@entities/session';

@Controller('courses')
@ApiTags('course stats')
@UseGuards(DefaultGuard)
export class CourseStatsController {
  constructor(
    private courseStatsService: CourseStatsService,
    private courseAccessService: CourseAccessService,
    private expelledStatsService: ExpelledStatsService,
  ) {}

  @Get('/stats/expelled')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOperation({ operationId: 'getExpelledStats' })
  @ApiOkResponse({ type: [CourseStatsDto] })
  public async getExpelledStats() {
    return this.expelledStatsService.findAll();
  }

  @Delete('/stats/expelled/:id')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOperation({ operationId: 'deleteExpelledStat' })
  @ApiOkResponse({ type: String }) // Assuming it returns a success message or ID
  public async deleteExpelledStat(@Param('id') id: string) {
    await this.expelledStatsService.remove(id);
    return 'Successfully deleted';
  }

  @Get('/aggregate/stats')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ operationId: 'getCoursesStats' })
  @ApiOkResponse({ type: CourseAggregateStatsDto })
  public async getCoursesStats(
    @Req() req: CurrentRequest,
    @Query('ids', new ParseArrayPipe({ items: Number, optional: true })) ids: number[],
    @Query('year', new ParseIntPipe({ optional: true })) year: number,
  ) {
    const allowedCourseIds = await this.courseAccessService.getUserAllowedCourseIds(req.user, ids, year);
    const data = await this.courseStatsService.getCoursesStats(allowedCourseIds);
    return new CourseAggregateStatsDto(data);
  }

  @Get('/:courseId/stats')
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

  @Get('/:courseId/stats/mentors')
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

  @Get('/:courseId/stats/mentors/countries')
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

  @Get('/:courseId/stats/students/countries')
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

  @Get('/:courseId/stats/students/certificates/countries')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getCourseStudentCertificatesCountries' })
  @ApiOkResponse({ type: CountriesStatsDto })
  @ApiBadRequestResponse()
  public async getStudentsWithCertificatesCountries(
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<CountriesStatsDto> {
    const data = await this.courseStatsService.getStudentsWithCertificatesCountries(courseId);
    return data;
  }

  @Get('/:courseId/stats/task/:taskId/performance')
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
