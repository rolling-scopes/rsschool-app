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
import { CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { ONE_HOUR_CACHE_TTL } from '../../constants';
import { CourseAccessService } from '../course-access.service';
import { CourseStatsService } from './course-stats.service';
import { CourseStatsDto, CountriesStatsDto, CourseMentorsStatsDto } from './dto';
import { CourseRole } from '@entities/index';

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
  @UseGuards(RoleGuard)
  @ApiOperation({ operationId: 'getCourseMentors' })
  @ApiOkResponse({ type: CourseMentorsStatsDto })
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Manager, CourseRole.Supervisor, Role.Admin, CourseRole.Dementor], true)
  public async getMentors(@Param('courseId', ParseIntPipe) courseId: number) {
    const data = await this.courseStatsService.getMentors(courseId);
    return new CourseMentorsStatsDto(data);
  }

  @Get('/mentors/countries')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @UseGuards(RoleGuard)
  @ApiOperation({ operationId: 'getCourseMentorCountries' })
  @ApiOkResponse({ type: CountriesStatsDto })
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Manager, CourseRole.Supervisor, Role.Admin, CourseRole.Dementor], true)
  public async getMentorCountries(@Param('courseId', ParseIntPipe) courseId: number): Promise<CountriesStatsDto> {
    const data = await this.courseStatsService.getMentorCountries(courseId);
    return data;
  }

  @Get('/students/countries')
  @CacheTTL(ONE_HOUR_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @UseGuards(RoleGuard)
  @ApiOperation({ operationId: 'getCourseStudentCountries' })
  @ApiOkResponse({ type: CountriesStatsDto })
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Manager, CourseRole.Supervisor, Role.Admin, CourseRole.Dementor], true)
  public async getStudentCountries(@Param('courseId', ParseIntPipe) courseId: number): Promise<CountriesStatsDto> {
    const data = await this.courseStatsService.getStudentCountries(courseId);
    return data;
  }
}
