import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { CourseScheduleService } from './course-schedule.service';
import { CourseScheduleItemDto } from './dto';
import { CourseCopyFromDto } from './dto/course-copy-from.dto';

@Controller('courses/:courseId/schedule')
@ApiTags('courses schedule')
export class CourseScheduleController {
  constructor(private courseScheduleService: CourseScheduleService) {}

  @Get()
  @ApiOkResponse({ type: [CourseScheduleItemDto] })
  @ApiOperation({ operationId: 'getSchedule' })
  @UseGuards(DefaultGuard, CourseGuard)
  public async getAll(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<CourseScheduleItemDto[]> {
    const studentId = req.user.courses[courseId]?.studentId ?? undefined;
    const data = await this.courseScheduleService.getAll(courseId, studentId);
    return data.map(item => new CourseScheduleItemDto(item));
  }

  @Post('/copy')
  @ApiOkResponse({})
  @ApiOperation({ operationId: 'copySchedule' })
  @ApiBody({ type: CourseCopyFromDto, required: true })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Manager, Role.Admin])
  public async copyFrom(
    @Param('courseId', ParseIntPipe) copyToCourseId: number,
    @Body() body: CourseCopyFromDto,
  ): Promise<void> {
    await this.courseScheduleService.copyFromTo(body.copyFromCourseId, copyToCourseId);
  }
}
