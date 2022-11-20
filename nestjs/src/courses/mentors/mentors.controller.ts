import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InsertResult } from 'typeorm';
import { MentorsService } from '.';
import { CurrentRequest, DefaultGuard } from '../../auth';
import { MentorDashboardDto } from './dto/mentor-dashboard.dto';
import { MentorStudentDto } from './dto/mentor-student.dto';

@Controller('mentors')
@ApiTags('mentors')
@UseGuards(DefaultGuard)
export class MentorsController {
  constructor(private mentorsService: MentorsService) {}

  @Get('/:mentorId/students')
  @ApiOperation({ operationId: 'getMentorStudents' })
  @ApiOkResponse({ type: [MentorStudentDto] })
  @ApiBadRequestResponse()
  public async getMentorStudents(@Param('mentorId', ParseIntPipe) mentorId: number, @Req() req: CurrentRequest) {
    const hasAccess = await this.mentorsService.canAccessMentor(req.user, mentorId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const items = await this.mentorsService.getStudents(mentorId);
    return items.map(item => new MentorStudentDto(item));
  }

  @Get('/:mentorId/course/:courseId/students')
  @ApiOperation({ operationId: 'getCourseStudentsCount' })
  @ApiOkResponse({ type: Number })
  @ApiBadRequestResponse()
  public async getCourseStudentsCount(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.mentorsService.canAccessMentor(req.user, mentorId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    return await this.mentorsService.getCourseStudentsCount(mentorId, courseId);
  }

  @Get('/:mentorId/course/:courseId/dashboard')
  @ApiOperation({ operationId: 'getMentorDashboardData' })
  @ApiOkResponse({ type: [MentorDashboardDto] })
  @ApiBadRequestResponse()
  public async getMentorDashboardData(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: CurrentRequest,
  ): Promise<MentorDashboardDto[]> {
    const hasAccess = await this.mentorsService.canAccessMentor(req.user, mentorId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    return await this.mentorsService.getStudentsTasks(mentorId, courseId);
  }

  @Get('/:mentorId/course/:courseId/random-task')
  @ApiOperation({ operationId: 'getRandomTask' })
  @ApiOkResponse({ type: InsertResult })
  @ApiBadRequestResponse()
  public async getRandomTask(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: CurrentRequest,
  ): Promise<InsertResult> {
    const hasAccess = await this.mentorsService.canAccessMentor(req.user, mentorId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    return await this.mentorsService.getRandomTask(mentorId, courseId);
  }
}
