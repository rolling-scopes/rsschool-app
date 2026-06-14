import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { Response } from 'express';
import { parseAsync } from 'json2csv';
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
