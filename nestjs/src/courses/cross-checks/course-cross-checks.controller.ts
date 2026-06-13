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
