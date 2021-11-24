import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CourseService } from './course.service';
import { RequiredRole, RoleGuard } from '../auth';

@Controller()
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('courses')
  @RequiredRole()
  @UseGuards(AuthGuard(['jwt', 'basic']), RoleGuard)
  public async getCourses() {
    const data = await this.courseService.getAll();
    return { data };
  }

  @Get('courses/:id')
  @UseGuards(AuthGuard(['jwt', 'basic']))
  public async getCourse(@Param('id', ParseIntPipe) id: number) {
    const data = await this.courseService.getOne(id);
    return { data };
  }
}
