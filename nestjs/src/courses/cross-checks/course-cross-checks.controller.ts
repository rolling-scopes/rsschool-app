import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CrossCheckMessageAuthorRole } from '@entities/taskSolutionResult';
import { CrossCheckStatus } from '@entities/courseTask';
import { ConfigService } from 'src/config';
import { UserNotificationsService } from 'src/users-notifications';
import { TaskSolution } from '@entities/taskSolution';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { CourseTasksService } from '../course-tasks';
import { OrderField, OrderDirection, CourseCrossCheckService } from './course-cross-checks.service';
import {
  BadCommentCheckerDto,
  CrossCheckFeedbackDto,
  CrossCheckPairResponseDto,
  CrossCheckSolutionDto,
  CrossCheckTaskDetailsDto,
  MaxScoreCheckerDto,
} from './dto';
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

  @Get('/:courseTaskId/max-score-checkers')
  @ApiOperation({ operationId: 'getMaxScoreCheckers' })
  @ApiOkResponse({ type: [MaxScoreCheckerDto] })
  @ApiForbiddenResponse()
  @RequiredRoles([CourseRole.Manager, CourseRole.Supervisor, CourseRole.Dementor, Role.Admin], true)
  @UseGuards(DefaultGuard, RoleGuard)
  public async getMaxScoreCheckers(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {
    return this.courseCrossCheckService.getCheckersWithMaxScore(courseTaskId);
  }

  @Get('/:courseTaskId/bad-comments')
  @ApiOperation({ operationId: 'getBadCommentCheckers' })
  @ApiOkResponse({ type: [BadCommentCheckerDto] })
  @ApiForbiddenResponse()
  @RequiredRoles([CourseRole.Manager, CourseRole.Supervisor, CourseRole.Dementor, Role.Admin], true)
  @UseGuards(DefaultGuard, RoleGuard)
  public async getBadCommentCheckers(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {
    return this.courseCrossCheckService.getCheckersWithoutComments(courseTaskId);
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

  @Post(':courseTaskId/messages/:taskSolutionResultId')
  @ApiOperation({ operationId: 'createCrossCheckMessage' })
  @ApiForbiddenResponse()
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse()
  public async createCrossCheckMessage(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Param('taskSolutionResultId', ParseIntPipe) taskSolutionResultId: number,
    @Body() inputData: { content: string; role: CrossCheckMessageAuthorRole },
  ) {
    const [student, taskSolutionResult, courseTask] = await Promise.all([
      this.courseCrossCheckService.queryStudentByGithubId(courseId, req.user.githubId),
      this.courseCrossCheckService.getTaskSolutionResultById(taskSolutionResultId),
      this.courseCrossCheckService.getCourseTaskWithCourse(courseTaskId),
    ]);

    if (!student) {
      throw new BadRequestException('not valid student or course');
    }
    if (!courseTask) {
      throw new BadRequestException('not valid task');
    }
    if (!taskSolutionResult) {
      throw new BadRequestException('task solution result is not exist');
    }

    this.validateMessageRole(inputData.role, student.id, taskSolutionResult);

    const data = {
      content: inputData.content ?? '',
      role: inputData.role,
    };

    await this.courseCrossCheckService.saveMessage(taskSolutionResultId, data, { user: req.user });

    const userId = await this.courseCrossCheckService.getMessageRecipientId(
      student.id,
      taskSolutionResult.checkerId,
      inputData.role,
    );
    if (!userId) {
      throw new BadRequestException('user not found');
    }

    await this.userNotificationsService
      .sendEventNotification({
        userId,
        notificationId: 'messages',
        data: {
          isReviewerMessage: inputData.role === CrossCheckMessageAuthorRole.Reviewer,
          courseAlias: courseTask.course.alias,
          courseTaskId,
          taskName: courseTask.task.name,
          studentGithubId: student.githubId,
        },
      })
      .catch(() => null);
  }

  @Put(':courseTaskId/messages/:taskSolutionResultId')
  @ApiOperation({ operationId: 'updateCrossCheckMessage' })
  @ApiForbiddenResponse()
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse()
  public async updateCrossCheckMessage(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) _courseTaskId: number,
    @Param('taskSolutionResultId', ParseIntPipe) taskSolutionResultId: number,
    @Body() inputData: { role: CrossCheckMessageAuthorRole },
  ) {
    const student = await this.courseCrossCheckService.queryStudentByGithubId(courseId, req.user.githubId);

    if (!student) {
      throw new BadRequestException('not valid student or course');
    }

    const taskSolutionResult = await this.courseCrossCheckService.getTaskSolutionResultById(taskSolutionResultId);

    if (!taskSolutionResult) {
      throw new BadRequestException('task solution result is not exist');
    }

    this.validateMessageRole(inputData.role, student.id, taskSolutionResult);

    await this.courseCrossCheckService.updateMessage(taskSolutionResultId, { role: inputData.role });
  }

  private validateMessageRole(
    role: CrossCheckMessageAuthorRole,
    studentId: number,
    taskSolutionResult: { studentId: number; checkerId: number },
  ) {
    switch (role) {
      case CrossCheckMessageAuthorRole.Reviewer:
        if (studentId !== taskSolutionResult.checkerId) {
          throw new BadRequestException('user is not checker');
        }
        break;

      case CrossCheckMessageAuthorRole.Student:
        if (studentId !== taskSolutionResult.studentId) {
          throw new BadRequestException('user is not student');
        }
        break;

      default:
        throw new BadRequestException('incorrect message role');
    }
  }

  @Get(':courseTaskId/results/:githubId')
  @ApiOperation({ operationId: 'getCrossCheckTaskResult' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ schema: { type: 'object' } })
  public async getCrossCheckTaskResult(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Param('githubId') githubIdParam: string,
  ) {
    const githubId = githubIdParam === 'me' ? req.user.githubId : githubIdParam.toLowerCase();

    const [student, checker, courseTask] = await Promise.all([
      this.courseCrossCheckService.queryStudentByGithubId(courseId, githubId),
      this.courseCrossCheckService.queryStudentByGithubId(courseId, req.user.githubId),
      this.courseCrossCheckService.getCourseTask(courseTaskId),
    ]);

    if (student == null || courseTask == null || checker == null) {
      throw new BadRequestException('not valid student or course task');
    }
    if (courseTask.checker !== 'crossCheck') {
      throw new BadRequestException('task solution is supported for this task');
    }

    const taskChecker = await this.courseCrossCheckService.getTaskSolutionChecker(student.id, checker.id, courseTaskId);
    if (taskChecker == null) {
      throw new BadRequestException('no assigned cross-check');
    }

    return this.courseCrossCheckService.getResult(courseTaskId, student.id, checker.id, checker.githubId);
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

    const taskChecker = await this.courseCrossCheckService.getTaskSolutionChecker(student.id, checker.id, courseTaskId);
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

  @Get(':courseTaskId/solutions/:githubId')
  @ApiOperation({ operationId: 'getCrossCheckTaskSolution' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: CrossCheckSolutionDto })
  public async getCrossCheckTaskSolution(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Param('githubId') githubIdParam: string,
  ) {
    const githubId = githubIdParam === 'me' ? req.user.githubId : githubIdParam.toLowerCase();

    const [student, courseTask] = await Promise.all([
      this.courseCrossCheckService.queryStudentByGithubId(courseId, githubId),
      this.courseCrossCheckService.getCourseTask(courseTaskId),
    ]);

    if (student == null || courseTask == null) {
      throw new BadRequestException('not valid student or course task');
    }

    const result = await this.courseCrossCheckService.getTaskSolution(student.id, courseTask.id);

    if (result == null) {
      throw new NotFoundException('solution is not found ');
    }

    const { updatedDate, id, url, review, comments } = result;

    return new CrossCheckSolutionDto({
      updatedDate,
      id,
      url,
      review,
      studentId: student.id,
      comments: comments.filter(c => c.authorId == student.id && c.recipientId == null),
    });
  }

  @Post(':courseTaskId/solutions/:githubId')
  @ApiOperation({ operationId: 'createCrossCheckSolution' })
  @ApiForbiddenResponse()
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse()
  public async createCrossCheckSolution(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Param('githubId') githubIdParam: string,
    @Body() body: Partial<TaskSolution>,
  ) {
    const githubId = this.resolveGithubId(req, githubIdParam);
    if (req.user.courses[courseId]?.isExpelled) {
      throw new ForbiddenException();
    }
    await this.validateCrossCheckExpirationDate(courseTaskId);

    const [student, courseTask] = await Promise.all([
      this.courseCrossCheckService.queryStudentByGithubId(courseId, githubId),
      this.courseCrossCheckService.getCourseTask(courseTaskId),
    ]);

    if (student == null || courseTask == null) {
      throw new BadRequestException('not valid student or course task');
    }
    if (!CourseCrossCheckService.isCrossCheckTask(courseTask)) {
      throw new BadRequestException('task solution is not supported for this task');
    }

    const { review, url, comments } = body ?? {};
    const taskSolution = {
      review,
      url,
      comments: comments?.map(c => ({ ...c, authorId: student.id })),
    };
    if (!CourseCrossCheckService.isValidTaskSolution(taskSolution)) {
      throw new BadRequestException('not valid request payload');
    }

    await this.courseCrossCheckService.saveSolution(student.id, courseTaskId, taskSolution);
  }

  @Delete(':courseTaskId/solutions/:githubId')
  @ApiOperation({ operationId: 'deleteCrossCheckSolution' })
  @ApiForbiddenResponse()
  @ApiOkResponse()
  public async deleteCrossCheckSolution(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Param('githubId') githubIdParam: string,
  ) {
    const githubId = this.resolveGithubId(req, githubIdParam);
    await this.validateCrossCheckExpirationDate(courseTaskId);

    const [student, courseTask] = await Promise.all([
      this.courseCrossCheckService.queryStudentByGithubId(courseId, githubId),
      this.courseCrossCheckService.getCourseTask(courseTaskId),
    ]);

    if (student == null || courseTask == null) {
      throw new BadRequestException('not valid student or course task');
    }
    if (!CourseCrossCheckService.isCrossCheckTask(courseTask)) {
      throw new BadRequestException('task solution is not supported for this task');
    }

    await this.courseCrossCheckService.deleteSolution(student.id, courseTaskId);
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

  @Get(':courseTaskId/details')
  @ApiOperation({ operationId: 'getCrossCheckTaskDetails' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: CrossCheckTaskDetailsDto })
  public async getTaskDetails(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {
    const data = await this.courseCrossCheckService.getTaskDetails(courseTaskId);
    return new CrossCheckTaskDetailsDto(data);
  }

  // legacy validateGithubIdAndAccess: me alias, lowercase, self or admin
  private resolveGithubId(req: CurrentRequest, githubIdParam: string) {
    const githubId = githubIdParam === 'me' ? req.user.githubId : githubIdParam.toLowerCase();
    if (!req.user.isAdmin && req.user.githubId !== githubId) {
      throw new ForbiddenException();
    }
    return githubId;
  }

  // legacy validateCrossCheckExpirationDate
  private async validateCrossCheckExpirationDate(courseTaskId: number) {
    const task = await this.courseCrossCheckService.getCourseTask(courseTaskId);
    if (!task || (task.studentEndDate && new Date() > new Date(task.studentEndDate))) {
      throw new BadRequestException('Cross Check deadline has expired');
    }
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
