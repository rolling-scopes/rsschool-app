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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { isAdmin, isManager, isMentor, isSupervisor } from '@entities/session';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { StudentSummaryDto } from './dto/student-summary.dto';
import { CourseStudentsService } from './course-students.service';
import { ExpelStatusDto } from './dto/student-status.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

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
