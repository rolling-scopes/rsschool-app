import { Controller, Get, Header, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from 'src/core/jwt/jwt.service';
import { CourseGuard, CurrentRequest, DefaultGuard } from '../../auth';
import { CoursesService } from '../courses.service';
import { CourseICalendarService } from './course-icalendar.service';
import { CourseScheduleService } from './course-schedule.service';
import { CourseScheduleTokenDto } from './dto';

@Controller('courses/:courseId/icalendar')
@ApiTags('courses schedule ical')
export class CourseICalendarController {
  constructor(
    private readonly courseScheduleService: CourseScheduleService,
    private readonly coursesService: CoursesService,
    private readonly courseICalendarService: CourseICalendarService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/token')
  @Header('Cache-Control', 'max-age=86400')
  @ApiOkResponse({ type: CourseScheduleTokenDto })
  @ApiOperation({ operationId: 'getScheduleICalendarToken' })
  @UseGuards(DefaultGuard, CourseGuard)
  public async getScheduleICalendarToken(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<CourseScheduleTokenDto> {
    return {
      token: this.jwtService.createPublicCalendarToken({ courseId, githubId: req.user.githubId }),
    };
  }

  @Get('/:token')
  @Header('Content-Type', 'text/calendar')
  @ApiOkResponse({ type: String })
  @ApiOperation({ operationId: 'getScheduleICalendar' })
  public async getScheduleICalendar(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('token') token: string,
    @Query('timezone') timezone: string,
  ): Promise<string> {
    const payload = this.jwtService.validateToken<{ githubId: string; courseId: number }>(token);
    await this.courseICalendarService.validateUserCourse(courseId, payload);
    const [data, course] = await Promise.all([
      this.courseScheduleService.getAll(courseId),
      this.coursesService.getById(courseId),
    ]);
    const result = await this.courseICalendarService.getICalendar(data, course.name, timezone || 'Europe/Minsk');
    return result;
  }
}
