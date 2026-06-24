import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { isAdmin, isManager, isMentor, isSupervisor } from '@entities/session';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { Response } from 'express';
import { parseAsync } from 'json2csv';
import { StudentSummaryDto } from './dto/student-summary.dto';
import { CourseStudentsService } from './course-students.service';
import { ExpelStatusDto } from './dto/student-status.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SelfStudentStatusDto, UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { UpdateMentoringAvailabilityDto } from './dto/update-mentoring-availability.dto';

@Controller('courses/:courseId/students')
@ApiTags('students')
@UseGuards(DefaultGuard)
export class CourseStudentsController {
  constructor(
    private courseStudentService: CourseStudentsService,
    private notificationService: UserNotificationsService,
  ) {}

  @Get(':githubId/summary')
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOkResponse({
    type: StudentSummaryDto,
  })
  @ApiOperation({ operationId: 'getStudentSummary' })
  public async getStudentSummary(@Param('courseId') courseId: number, @Param('githubId') githubId: string) {
    const student = await this.courseStudentService.getStudentByGithubId(courseId, githubId);

    if (student === null) {
      throw new NotFoundException(`Student with GitHub id ${githubId} not found`);
    }
    const [score, mentor] = await Promise.all([
      this.courseStudentService.getStudentScore(student?.id),
      student?.mentorId ? await this.courseStudentService.getMentorWithContacts(student.mentorId) : null,
    ]);

    return new StudentSummaryDto({
      totalScore: score?.totalScore,
      results: score?.results,
      rank: score?.rank,
      isActive: !student?.isExpelled && !student?.isFailed,
      mentor,
    });
  }

  @Get('/details')
  @ApiOperation({ operationId: 'getCourseStudentsWithDetails' })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  @ApiForbiddenResponse()
  @UseGuards(RoleGuard)
  @RequiredRoles([CourseRole.Supervisor, CourseRole.Manager, CourseRole.Dementor, Role.Admin], true)
  public async getCourseStudentsWithDetails(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('status') status?: string,
  ) {
    return this.courseStudentService.getStudentsWithDetails(courseId, status === 'active');
  }

  @Get('/search/:searchText')
  @ApiOperation({ operationId: 'searchCourseStudents' })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  public async searchCourseStudents(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('searchText') searchText: string,
    @Query('onlyStudentsWithoutMentorShown') onlyStudentsWithoutMentorShown?: string,
  ) {
    return this.courseStudentService.searchCourseStudents(
      courseId,
      searchText,
      onlyStudentsWithoutMentorShown === 'true',
    );
  }

  @Get('/csv')
  @ApiOperation({ operationId: 'getCourseStudentsCsv' })
  @ApiForbiddenResponse()
  @UseGuards(RoleGuard)
  @RequiredRoles([CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async getCourseStudentsCsv(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Res() res: Response,
    @Query('status') status?: string,
  ) {
    const students = await this.courseStudentService.getStudentsForCsv(courseId, status === 'active');
    const csv = await parseAsync(students);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.end(csv);
  }

  @Put(':githubId')
  @ApiOperation({ operationId: 'updateStudent' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async updateStudent(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('githubId') githubId: string,
    @Body() dto: UpdateStudentDto,
  ) {
    const student = await this.courseStudentService.getStudentByGithubId(courseId, githubId);
    if (student == null || dto.mentorGithuId === undefined) {
      throw new BadRequestException();
    }
    const user = req.user;
    const isPowerUserOrSupervisor = isAdmin(user) || isManager(user, courseId) || isSupervisor(user, courseId);
    if (!isPowerUserOrSupervisor && isMentor(user, courseId)) {
      const menteeGithubIds = await this.courseStudentService.getMenteeGithubIds(courseId, user.githubId);
      const isUpdatedStudentMenteeOfRequestor = menteeGithubIds.includes(githubId);
      const isSelfAssignStudent = user.githubId === dto.mentorGithuId;
      if (!isUpdatedStudentMenteeOfRequestor && !isSelfAssignStudent) {
        throw new ForbiddenException();
      }
    }
    let mentor = null;
    if (dto.mentorGithuId) {
      mentor = await this.courseStudentService.getMentorBasicByGithubId(courseId, dto.mentorGithuId);
      if (!mentor) {
        throw new BadRequestException();
      }
    }
    await this.courseStudentService.setStudentMentor(student.id, mentor?.id ?? null);

    if (mentor) {
      await this.notificationService.sendEventNotification({
        notificationId: 'mentor:assigned',
        userId: student.id,
        data: { mentor },
      });
    }

    return this.courseStudentService.getStudentWithMentor(courseId, githubId);
  }

  @Post(':githubId/status')
  @ApiOperation({ operationId: 'updateStudentStatus' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, CourseRole.Dementor, Role.Admin], true)
  public async updateStudentStatus(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('githubId') githubId: string,
    @Body() dto: UpdateStudentStatusDto,
  ) {
    const { allow, message = 'no access' } = await this.courseStudentService.canChangeStatus(
      req.user,
      courseId,
      githubId,
    );
    if (!allow) {
      throw new BadRequestException(message);
    }
    switch (dto.status) {
      case 'active':
        await this.courseStudentService.restoreStudent(courseId, githubId);
        break;
      case 'expelled':
        await this.courseStudentService.expelStudent(courseId, githubId, dto.comment);
        break;
      case 'self-study':
        await this.courseStudentService.setSelfStudy(courseId, githubId, dto.comment);
        break;
    }
  }

  @Post(':githubId/status-self')
  @ApiOperation({ operationId: 'selfUpdateStudentStatus' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @UseGuards(CourseGuard)
  public async selfUpdateStudentStatus(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('githubId') githubId: string,
    @Body() _dto: SelfStudentStatusDto,
  ) {
    if (req.user.githubId !== githubId) {
      throw new BadRequestException('access denied');
    }
    await this.courseStudentService.setSelfStudy(courseId, githubId);
  }

  @Post(':githubId/availability')
  @ApiOperation({ operationId: 'updateMentoringAvailability' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @UseGuards(RoleGuard)
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  public async updateMentoringAvailability(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('githubId') githubId: string,
    @Body() dto: UpdateMentoringAvailabilityDto,
  ) {
    const student = await this.courseStudentService.getStudentByGithubId(courseId, githubId);
    if (student == null) {
      throw new BadRequestException('Student not found');
    }
    await this.courseStudentService.updateMentoringAvailability(student.id, dto.mentoring ?? false);
  }

  @Post('expel')
  @ApiOperation({ operationId: 'expelStudents' })
  @UseGuards(RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async expelStudents(@Param('courseId') courseId: number, @Body() expelStatusDto: ExpelStatusDto) {
    return this.courseStudentService.expelStudents({
      courseId,
      expelStatusDto,
    });
  }
}
