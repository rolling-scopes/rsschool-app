import { Course } from '@entities/course';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '../auth';
import { DefaultGuard, RequiredAppRoles, RoleGuard } from '../auth';
import { CoursesService } from './courses.service';
import { CourseDto } from './dto';
@Controller('courses')
@ApiTags('courses')
@UseGuards(DefaultGuard, RoleGuard)
export class CoursesController {
  constructor(private courseService: CoursesService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getCourses' })
  @ApiOkResponse({ type: [CourseDto] })
  public async getCourses() {
    const data = await this.courseService.getAll();
    return data.map(it => new CourseDto(it));
  }

  @Get('/:aliasOrId')
  @ApiOperation({ operationId: 'getCourse' })
  public async getCourse(@Param('aliasOrId') aliasOrId: string) {
    const id = Number(aliasOrId);
    let data: Course | null = null;
    if (!Number.isNaN(id)) {
      data = await this.courseService.getById(id);
    } else {
      data = await this.courseService.getByAlias(aliasOrId.toString());
    }
    return new CourseDto(data);
  }
}
