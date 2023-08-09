import { CacheTTL, Controller, Get, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { CourseMentorsService } from './course-mentors.service';
import { CourseGuard, CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from 'src/constants';
import { parseAsync, transforms } from 'json2csv';
import { Response } from 'express';

@Controller('course/:courseId/mentors')
export class CourseMentorsController {
  constructor(private readonly courseMentorsService: CourseMentorsService) {}

  @Get('details')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  getMentorsDetails(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseMentorsService.getMentorsWithStats(courseId);
  }

  @Get('details/csv')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  async getMentorsDetailsCsv(@Param('courseId', ParseIntPipe) courseId: number, @Res() res: Response) {
    const results = await this.courseMentorsService.getMentorsWithStats(courseId);
    const parsedData = await parseAsync(results, { transforms: [transforms.flatten()] });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', `filename=mentors.csv`);

    res.end(parsedData);
  }

  @Get('search/:searchText')
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseGuards(DefaultGuard, CourseGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  searchMentors(@Param('courseId', ParseIntPipe) courseId: number, @Param('searchText') searchText: string) {
    return this.courseMentorsService.searchMentors(courseId, `${searchText}%`);
  }
}
