import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, RoleGuard } from '../auth';
import { CourseAccessService } from './course-access.service';
import { CoursesService } from './courses.service';
import { CourseDto, LeaveCourseRequestDto } from './dto';

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

  @Post('/:courseId/leave')
  @ApiOperation({ operationId: 'leaveCourse' })
  @ApiBody({ type: LeaveCourseRequestDto, required: false })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Student])
  public async leaveCourse(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body('comment') comment?: string,
  ) {
    if (!this.courseAccessService.canAccessCourse(req.user, courseId)) {
      throw new ForbiddenException();
    }
    const studentId = req.user.courses[courseId]?.studentId;
    if (studentId) {
      await this.courseAccessService.leaveAsStudent(courseId, studentId, comment);
    }
  }

  @Post('/:courseId/rejoin')
  @ApiOperation({ operationId: 'rejoinCourse' })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Student])
  public async rejoinCourse(@Req() req: CurrentRequest, @Param('courseId', ParseIntPipe) courseId: number) {
    if (!this.courseAccessService.canAccessCourse(req.user, courseId)) {
      throw new ForbiddenException();
    }
    const studentId = req.user.courses[courseId]?.studentId;
    if (studentId) {
      await this.courseAccessService.rejoinAsStudent(courseId, studentId);
    }
  }
}
