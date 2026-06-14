import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CrossCheckStatus } from '@entities/courseTask';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { CourseTasksService } from '../course-tasks';
import { WriteScoreService } from '../score';
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
    private writeScoreService: WriteScoreService,
  ) {}

  private static readonly DEFAULT_PAIRS_COUNT = 4;

  @Post(':courseTaskId/distribution')
  @ApiOperation({ operationId: 'createCrossCheckDistribution' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ schema: { type: 'object' } })
  @RequiredRoles([CourseRole.Manager, Role.Admin])
  @UseGuards(DefaultGuard, RoleGuard)
  public async createCrossCheckDistribution(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {
    const courseTask = await this.courseCrossCheckService.getCourseTask(courseTaskId);

    if (courseTask == null) {
      throw new BadRequestException();
    }
    if (!CourseCrossCheckService.isSubmissionDeadlinePassed(courseTask)) {
      throw new BadRequestException();
    }

    return this.courseCrossCheckService.distributeCrossCheck(courseTask, courseTaskId);
  }

  @Post(':courseTaskId/completion')
  @ApiOperation({ operationId: 'createCrossCheckCompletion' })
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @RequiredRoles([CourseRole.Manager, Role.Admin])
  @UseGuards(DefaultGuard, RoleGuard)
  public async createCrossCheckCompletion(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {
    const courseTask = await this.courseCrossCheckService.getCourseTask(courseTaskId);

    if (courseTask == null) {
      throw new BadRequestException();
    }
    if (
      !CourseCrossCheckService.isSubmissionDeadlinePassed(courseTask) ||
      courseTask.crossCheckStatus === CrossCheckStatus.Initial
    ) {
      throw new BadRequestException();
    }

    const pairsCount = Math.max((courseTask.pairsCount ?? CourseCrossCheckController.DEFAULT_PAIRS_COUNT) - 1, 1);
    const studentScores = await this.courseCrossCheckService.getTaskSolutionCheckers(courseTaskId, pairsCount);

    for (const studentScore of studentScores) {
      const data = { authorId: -1, comment: 'Cross-Check score', score: studentScore.score };
      await this.writeScoreService.saveScore(studentScore.studentId, courseTaskId, data);
    }

    await this.courseCrossCheckService.changeCourseTaskStatus(courseTask, CrossCheckStatus.Completed);
  }

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
