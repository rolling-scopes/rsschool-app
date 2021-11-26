import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../auth';
import { DefaultGuard, RequiredAppRoles, RoleGuard } from '../auth';
import { CoursesService } from './courses.service';

@Controller()
@ApiTags('courses')
export class CourseController {
  constructor(private courseService: CoursesService) {}

  @Get('courses')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredAppRoles([Role.Admin])
  public async getCourses() {
    const items = await this.courseService.getAll();
    return { items };
  }

  @Get('courses/:aliasOrId')
  @UseGuards(DefaultGuard)
  public async getCourse(@Param('aliasOrId') aliasOrId: number | string) {
    const id = Number(aliasOrId);
    if (!Number.isNaN(id)) {
      return this.courseService.getById(id);
    }
    return this.courseService.getByAlias(aliasOrId.toString());
  }
}
