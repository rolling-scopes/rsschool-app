import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '../auth';
import { DefaultGuard, RequiredAppRoles, RoleGuard } from '../auth';
import { CoursesService } from './courses.service';

@Controller('courses')
@ApiTags('courses')
export class CoursesController {
  constructor(private courseService: CoursesService) {}

  @Get('/')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredAppRoles([Role.Admin])
  public async getCourses() {
    const items = await this.courseService.getAll();
    return { items };
  }

  @Get('/:aliasOrId')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'getCourse' })
  public async getCourse(@Param('aliasOrId') aliasOrId: string) {
    const id = Number(aliasOrId);
    if (!Number.isNaN(id)) {
      return this.courseService.getById(id);
    }
    return this.courseService.getByAlias(aliasOrId.toString());
  }
}
