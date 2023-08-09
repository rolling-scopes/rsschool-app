import { CacheTTL, Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CourseMentorsService } from './course-mentors.service';
import { CourseGuard, CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from 'src/constants';

@Controller('course/:courseId/mentors')
export class CourseMentorsController {
  constructor(private readonly courseMentorsService: CourseMentorsService) {}

  @Get()
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  findAll(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseMentorsService.findAll(courseId);
  }

  @Get('details')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  getMentorsDetails(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseMentorsService.getMentorsWithStats(courseId);
  }

  @Get('search/:searchText')
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseGuards(DefaultGuard, CourseGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  searchMentors(@Param('courseId', ParseIntPipe) courseId: number, @Param('searchText') searchText: string) {
    return this.courseMentorsService.searchMentors(courseId, searchText);
  }
}
