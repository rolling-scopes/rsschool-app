import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { CourseTasksService } from '../course-tasks';
import { OrderField, OrderDirection, CourseCrossCheckService } from './course-cross-checks.service';
import { CrossCheckFeedbackDto, CrossCheckPairResponseDto } from './dto';
import { AvailableReviewStatsDto } from './dto/available-review-stats.dto';
import { parseAsync } from 'json2csv';
import { Response } from 'express';
import { StudentId } from 'src/core/decorators';
import { FeedbackGuard } from './cross-check-feedback.guard';

@Controller('courses/:courseId/cross-checks')
@ApiTags('courses tasks')
@UseGuards(DefaultGuard, CourseGuard)
export class CourseCrossCheckController {
  constructor(
    private courseCrossCheckService: CourseCrossCheckService,
    private courseTasksService: CourseTasksService,
  ) {}

  @Get('/pairs')
  @ApiOperation({ operationId: 'getCrossCheckPairs' })
  @ApiForbiddenResponse()
  @ApiResponse({ type: CrossCheckPairResponseDto })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'orderDirection', required: false })
  @ApiQuery({ name: 'checker', required: false })
  @ApiQuery({ name: 'student', required: false })
  @ApiQuery({ name: 'url', required: false })
  @ApiQuery({ name: 'task', required: false })
  @RequiredRoles([CourseRole.Manager, CourseRole.Dementor, Role.Admin], true)
  @UseGuards(DefaultGuard, RoleGuard)
  public async getPairs(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('pageSize') pageSize: number = 100,
    @Query('current') current: number = 1,
    @Query('orderBy', new DefaultValuePipe(OrderField.Student), new ParseEnumPipe(OrderField)) orderBy: OrderField,
    @Query('orderDirection', new DefaultValuePipe(OrderDirection.Asc), new ParseEnumPipe(OrderDirection))
    orderDirection: OrderDirection,
    @Query('checker') checker: string,
    @Query('student') student: string,
    @Query('url') url: string,
    @Query('task') task: string,
  ) {
    const { items, pagination } = await this.courseCrossCheckService.findPairs(
      courseId,
      { pageSize, current },
      { checker, student, url, task },
      { orderBy, orderDirection },
    );
    return new CrossCheckPairResponseDto(items, pagination);
  }

  @Get('/available-review-stats')
  @ApiOperation({ operationId: 'getAvailableCrossCheckReviewStats' })
  @ApiForbiddenResponse()
  @ApiResponse({ type: [AvailableReviewStatsDto] })
  @RequiredRoles([CourseRole.Student])
  @UseGuards(DefaultGuard, RoleGuard)
  public async getAvailableCrossCheckReviewStats(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: CurrentRequest,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    if (!studentId) throw new BadRequestException();
    const crossChecks = await this.courseTasksService.getAvailableCrossChecks(courseId);
    if (crossChecks.length === 0) return [];
    const res = await this.courseCrossCheckService.getAvailableCrossChecksStats(crossChecks, studentId);
    return res.map(e => new AvailableReviewStatsDto(e));
  }

  @Get(':courseTaskId/csv')
  @ApiOperation({ operationId: 'getCrossCheckCsv' })
  @ApiForbiddenResponse()
  @RequiredRoles([CourseRole.Dementor, CourseRole.Manager, Role.Admin])
  @UseGuards(DefaultGuard, RoleGuard)
  public async getSolutionsUrls(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Res() res: Response,
  ) {
    const [courseTask, solutionUrls] = await Promise.all([
      this.courseTasksService.getById(courseTaskId),
      this.courseCrossCheckService.getSolutionsUrls(courseId, courseTaskId),
    ]);

    const parsedData = await parseAsync(solutionUrls, { fields: ['githubId', 'solutionUrl'] });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', `filename=${courseTask.task.name}.csv`);

    res.end(parsedData);
  }

  @Get(':courseTaskId/assignments/:githubId')
  @ApiOperation({ operationId: 'getCrossCheckAssignments' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  public async getCrossCheckAssignments(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Param('githubId') githubIdParam: string,
  ) {
    const githubId = githubIdParam === 'me' ? req.user.githubId : githubIdParam.toLowerCase();
    if (!req.user.isAdmin && req.user.githubId !== githubId) {
      throw new ForbiddenException();
    }

    const [student, courseTask] = await Promise.all([
      this.courseCrossCheckService.queryStudentByGithubId(courseId, githubId),
      this.courseCrossCheckService.getCourseTask(courseTaskId),
    ]);

    if (student == null || courseTask == null) {
      throw new BadRequestException('not valid student or course task');
    }
    if (courseTask.checker !== 'crossCheck') {
      throw new BadRequestException('not supported task');
    }

    const records = await this.courseCrossCheckService.getTaskSolutionAssignments(student.id, courseTaskId);
    return records.map(r => ({
      student: CourseCrossCheckService.convertToStudentBasic(r.student),
      url: r.taskSolution.url,
    }));
  }

  @Get(':courseTaskId/feedbacks/my')
  @ApiOperation({ operationId: 'getMyCrossCheckFeedbacks' })
  @ApiForbiddenResponse()
  @ApiResponse({ type: CrossCheckFeedbackDto })
  @RequiredRoles([CourseRole.Manager, Role.Admin, CourseRole.Student], true)
  @UseGuards(DefaultGuard, RoleGuard, FeedbackGuard)
  public async getMyCrossCheckFeedbacks(
    @StudentId() studentId: number,
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {
    const [crossCheckSolutionReviews, taskSolution] = await Promise.all([
      this.courseCrossCheckService.getCrossCheckSolutionReviews(studentId, courseTaskId),
      this.courseCrossCheckService.getTaskSolution(studentId, courseTaskId),
    ]);
    return new CrossCheckFeedbackDto(crossCheckSolutionReviews, taskSolution);
  }
}
