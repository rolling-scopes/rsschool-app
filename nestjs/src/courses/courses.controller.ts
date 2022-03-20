import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../auth';
import { CourseAccessService } from './course-access.service';
import { CoursesService } from './courses.service';
import { CourseDto } from './dto';
@Controller('courses')
@ApiTags('courses')
@UseGuards(DefaultGuard)
export class CoursesController {
  constructor(private courseService: CoursesService, private courseAccessService: CourseAccessService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getCourses' })
  @ApiOkResponse({ type: [CourseDto] })
  public async getCourses() {
    const data = await this.courseService.getAll();
    return data.map(it => new CourseDto(it));
  }

  @Get('/:courseId')
  @ApiOperation({ operationId: 'getCourse' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: CourseDto })
  public async getCourse(@Req() req: CurrentRequest, @Param('courseId', ParseIntPipe) courseId: number) {
    if (!this.courseAccessService.canAccessCourse(req.user, courseId)) {
      throw new ForbiddenException();
    }
    const data = await this.courseService.getById(courseId);
    return new CourseDto(data);
  }
}
