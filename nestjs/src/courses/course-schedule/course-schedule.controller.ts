import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { parseAsync } from 'json2csv';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { toCsvFile } from '../../core/csv';
import { CourseScheduleService } from './course-schedule.service';
import { CourseScheduleItemDto } from './dto';
import { CourseCopyFromDto } from './dto/course-copy-from.dto';

const DEFAULT_TIMEZONE = 'Europe/Minsk';

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

  @Get('/csv/:timeZone')
  @ApiOperation({ operationId: 'getScheduleAsCsv' })
  @ApiForbiddenResponse()
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async getScheduleAsCsv(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('timeZone') timeZone: string,
  ) {
    const tz = timeZone ? timeZone.replace('_', '/') : DEFAULT_TIMEZONE;
    const rows = await this.courseScheduleService.getScheduleAsCsvRows(courseId, tz);
    const csv = await parseAsync(rows);

    return toCsvFile(csv, `filename="schedule_${courseId}.csv"`);
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
