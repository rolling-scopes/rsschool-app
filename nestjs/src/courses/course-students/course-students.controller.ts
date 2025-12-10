import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { StudentSummaryDto } from './dto/student-summary.dto';
import { CourseStudentsService } from './course-students.service';
import { ExpelStatusDto } from './dto/student-status.dto';

@Controller('courses/:courseId/students')
@ApiTags('students')
@UseGuards(DefaultGuard)
export class CourseStudentsController {
  constructor(private courseStudentService: CourseStudentsService) {}

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
      repository: student?.repository ?? null,
    });
  }

  @Post('expel')
  @ApiOperation({ operationId: 'expelStudents' })
  @UseGuards(RoleGuard)
  @RequiredRoles([Role.Admin])
  public async expelStudents(@Param('courseId') courseId: number, @Body() expelStatusDto: ExpelStatusDto) {
    return this.courseStudentService.expelStudents({
      courseId,
      expelStatusDto,
    });
  }
}
