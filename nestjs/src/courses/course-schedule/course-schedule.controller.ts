import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CurrentRequest, DefaultGuard } from '../../auth';
import { CourseScheduleService } from './course-schedule.service';
import { CourseScheduleItemDto } from './dto';

@Controller('courses/:courseId/schedule')
@ApiTags('courses schedule')
export class CourseScheduleController {
  constructor(private courseTasksService: CourseScheduleService) {}

  @Get()
  @ApiOkResponse({ type: [CourseScheduleItemDto] })
  @ApiOperation({ operationId: 'getSchedule' })
  @UseGuards(DefaultGuard, CourseGuard)
  public async getAll(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<CourseScheduleItemDto[]> {
    const studentId = req.user.courses[courseId]?.studentId ?? undefined;
    const data = await this.courseTasksService.getAll(courseId, studentId);
    return data.map(item => new CourseScheduleItemDto(item));
  }
}
