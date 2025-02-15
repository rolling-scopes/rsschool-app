import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MentorsService } from '.';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, RoleGuard } from '../../auth';
import { MentorDashboardDto } from './dto/mentor-dashboard.dto';
import { MentorOptionsDto } from './dto/mentor-options.dto';
import { MentorStudentDto } from './dto/mentor-student.dto';
import { MentorInReviewTasksCountDto } from './dto/mentor-in-review-tasks-count.dto';

@Controller('mentors')
@ApiTags('mentors')
@UseGuards(DefaultGuard, RoleGuard)
export class MentorsController {
  constructor(private mentorsService: MentorsService) {}

  @Get('/:mentorId/course/:courseId/options')
  @ApiOperation({ operationId: 'getMentorOptions' })
  @ApiOkResponse({ type: MentorOptionsDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @RequiredRoles([CourseRole.Mentor])
  public async getMentorOptions(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: CurrentRequest,
  ) {
    const courseMentorId = req.user.courses[courseId]?.mentorId;
    if (courseMentorId !== mentorId) {
      throw new ForbiddenException();
    }

    const mentor = await this.mentorsService.getMentorOptions(mentorId);

    if (!mentor) {
      throw new NotFoundException();
    }

    return new MentorOptionsDto(mentor);
  }

  @Get('/:mentorId/students')
  @ApiOperation({ operationId: 'getMentorStudents' })
  @ApiOkResponse({ type: [MentorStudentDto] })
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager])
  public async getMentorStudents(@Param('mentorId', ParseIntPipe) mentorId: number, @Req() req: CurrentRequest) {
    const items = await this.mentorsService.getStudents(mentorId, req.user.id);
    return items.map(item => new MentorStudentDto(item));
  }

  @Get('/:mentorId/course/:courseId/students')
  @ApiOperation({ operationId: 'getCourseStudentsCount' })
  @ApiOkResponse({ type: Number })
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager])
  public async getCourseStudentsCount(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return await this.mentorsService.getCourseStudentsCount(mentorId, courseId);
  }

  @Get('/:mentorId/course/:courseId/dashboard')
  @ApiOperation({ operationId: 'getMentorDashboardData' })
  @ApiOkResponse({ type: [MentorDashboardDto] })
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager])
  public async getMentorDashboardData(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<MentorDashboardDto[]> {
    return await this.mentorsService.getStudentsTasks(mentorId, courseId);
  }

  @Get('/:mentorId/course/:courseId/random-task')
  @ApiOperation({ operationId: 'getRandomTask' })
  @ApiOkResponse({})
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager])
  public async getRandomTask(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return await this.mentorsService.getRandomTask(mentorId, courseId);
  }

  @Get('/:mentorId/course/:courseId/in-review-count')
  @ApiOperation({ operationId: 'getInReviewTasksCount' })
  @ApiOkResponse({ type: MentorInReviewTasksCountDto })
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager], true)
  public async getInReviewTasksCount(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const count = await this.mentorsService.getInReviewTasksCount(mentorId, courseId);
    return new MentorInReviewTasksCountDto(count);
  }
}
