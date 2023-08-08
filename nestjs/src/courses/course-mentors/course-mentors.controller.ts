import { Controller, Get, Param } from '@nestjs/common';
import { CourseMentorsService } from './course-mentors.service';

@Controller('course/:courseId/mentors')
export class CourseMentorsController {
  constructor(private readonly courseMentorsService: CourseMentorsService) {}

  @Get()
  findAll(@Param('courseId') courseId: string) {
    return this.courseMentorsService.findAll(+courseId);
  }

  @Get('details')
  getMentorsDetails(@Param('courseId') courseId: string) {
    return this.courseMentorsService.getMentorsWithStats(+courseId);
  }
}
