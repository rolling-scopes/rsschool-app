import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../../auth';
// import { StudentsService } from '../students';
import { StudentSummaryDto } from './dto/student-summary.dto';

@Controller('courses/:courseId/students')
@ApiTags('students')
@UseGuards(DefaultGuard)
export class CourseStudentsController {
//   constructor(private studentsService: StudentsService) {}

  @Get(':studentId/summary')
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getStudentSummary' })
  public async getStudentSummary(
    @Param('courseId') courseId: number,
    @Param('studentId') githubId: string,
    @Req() req: CurrentRequest,
  ) {
    let studentGithubId;
    if (githubId === 'me') {
      studentGithubId = req.user.githubId;
    } else {
      studentGithubId = githubId;
    }
    return new StudentSummaryDto({
      totalScore: 0,
      rank: 5,
      results: [
        {
          score: 50,
          courseTaskId: 719,
        },
      ],
      isActive: true,
      mentor: {
        isActive: true,
        name: 'dmitry romaniuk',
        id: 1273,
        githubId: studentGithubId,
        students: [],
        cityName: 'Minsk',
        countryName: 'Belarus',
        contactsEmail: 'hello@example.com',
        contactsSkype: null,
        contactsWhatsApp: null,
        contactsTelegram: 'pavel_durov',
        contactsNotes: 'do not call me',
        contactsPhone: null,
      },
      repository: null,
      discord: 'eleven'
    });
  }
}
