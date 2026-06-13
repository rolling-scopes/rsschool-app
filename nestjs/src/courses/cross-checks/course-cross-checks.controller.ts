import {
  BadRequestException,
  Body,
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
import { ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CrossCheckStatus } from '@entities/courseTask';
import { ConfigService } from 'src/config';
import { UserNotificationsService } from 'src/users-notifications';
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
    private userNotificationsService: UserNotificationsService,
    private configService: ConfigService,
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

  @Post(':courseTaskId/results/:githubId')
  @ApiOperation({ operationId: 'createCrossCheckResult' })
  @ApiForbiddenResponse()
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse()
  public async createCrossCheckResult(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Param('githubId') githubIdParam: string,
    @Body()
    inputData: {
      score: number;
      comment: string;
      anonymous: boolean;
      review: unknown;
      comments: unknown;
      criteria: unknown;
    },
  ) {
    const githubId = githubIdParam === 'me' ? req.user.githubId : githubIdParam.toLowerCase();

    const [student, checker, courseTask] = await Promise.all([
      this.courseCrossCheckService.queryStudentByGithubId(courseId, githubId),
      this.courseCrossCheckService.queryStudentByGithubId(courseId, req.user.githubId),
      this.courseCrossCheckService.getCourseTaskWithCourse(courseTaskId),
    ]);

    if (courseTask?.crossCheckStatus !== CrossCheckStatus.Distributed) {
      throw new BadRequestException("task review can't be submitted");
    }

    if (student == null || courseTask == null || checker == null) {
      throw new BadRequestException('not valid student or course task');
    }
    if (!CourseCrossCheckService.isCrossCheckTask(courseTask)) {
      throw new BadRequestException('task solution is supported for this task');
    }

    const taskChecker = await this.courseCrossCheckService.getTaskSolutionChecker(
      student.id,
      checker.id,
      courseTaskId,
    );
    if (taskChecker == null) {
      throw new BadRequestException('no assigned cross-check');
    }

    const data = {
      score: Math.round(Number(inputData.score)),
      comment: inputData.comment || '',
      anonymous: inputData.anonymous !== false,
      review: (Array.isArray(inputData.review) ? inputData.review : []) as never[],
    };

    if (data.score > courseTask.maxScore) {
      throw new BadRequestException('score provided is greater than max score for the task');
    }

    if (isNaN(data.score) || data.score < 0) {
      throw new BadRequestException('no score provided');
    }

    const previousScore = await this.courseCrossCheckService.saveResult(
      courseTaskId,
      taskChecker.studentId,
      taskChecker.checkerId,
      data,
      { userId: req.user.id, criteria: inputData.criteria as never[] },
    );

    await this.courseCrossCheckService.saveSolutionComments(taskChecker.studentId, courseTaskId, {
      comments: (inputData.comments ?? []) as never[],
      authorId: taskChecker.checkerId,
      authorGithubId: req.user.githubId,
      recipientId: taskChecker.studentId,
    });

    await this.userNotificationsService.sendEventNotification({
      userId: student.userId,
      notificationId: 'taskGrade',
      data: {
        previousScore,
        courseTask,
        score: data.score,
        comment: data.comment,
        resultLink: `${this.configService.host}/course/student/cross-check-submit?course=${courseTask.course.alias}&taskId=${courseTaskId}`,
      },
    });
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
