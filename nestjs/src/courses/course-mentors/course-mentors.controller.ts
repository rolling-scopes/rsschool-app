import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CourseMentorsService } from './course-mentors.service';
import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';

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
}
