import { Controller, Get, NotFoundException, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../../auth';
import { StudentSummaryDto } from './dto/student-summary.dto';
import { CourseStudentsService } from './course-students.service';

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
  public async getStudentSummary(
    @Param('courseId') courseId: number,
    @Param('githubId') githubId: string,
    @Req() req: CurrentRequest,
  ) {
    const studentGithubId = githubId === 'me' ? req.user.githubId : githubId;

    const student = await this.courseStudentService.getStudentByGithubId(courseId, studentGithubId);

    if (student === null) {
      throw new NotFoundException(`Student with GitHub id ${studentGithubId} not found`);
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
      repository: student?.repository || null,
    });
  }
}
