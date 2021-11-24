import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DefaultGuard, RequiredRole, RoleGuard } from '../auth';
import { CourseService } from './course.service';

@Controller()
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('courses')
  @RequiredRole()
  @UseGuards(DefaultGuard, RoleGuard)
  public async getCourses() {
    const data = await this.courseService.getAll();
    return { data };
  }

  @Get('courses/:aliasOrId')
  @UseGuards(DefaultGuard)
  public async getCourse(@Param('aliasOrId') aliasOrId: number | string) {
    const id = Number(aliasOrId);
    if (!Number.isNaN(id)) {
      const data = await this.courseService.getById(id);
      return { data };
    }
    const alias = aliasOrId.toString();
    const data = await this.courseService.getByAlias(alias);
    return { data };
  }
}
