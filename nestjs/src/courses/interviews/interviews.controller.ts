import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  Delete,
  Put,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from '../../constants';
import { InterviewDto } from './dto';
import { AvailableStudentDto } from './dto/available-student.dto';
import { InterviewsService } from './interviews.service';
import { StageInterviewsService } from './stage-interviews.service';
import { CreateStageInterviewsDto, UpdateStageInterviewPairDto } from './dto/stage-interview-pair.dto';
import { UserNotificationsService } from 'src/users-notifications';
import { TaskType } from '@entities/task';
import { InterviewFeedbackService } from './interviewFeedback.service';
import { InterviewFeedbackDto } from './dto/get-interview-feedback.dto';
import { PutInterviewFeedbackDto } from './dto/put-interview-feedback.dto';
import { RegistrationInterviewDto } from './dto/registration-interview.dto';
import { InterviewPairDto } from './dto/interview-pair.dto';
import { InterviewCommentDto } from './dto/interview-comment.dto';
import { CourseTasksService } from '../course-tasks';
import { InterviewDistributeDto, InterviewDistributeResponseDto } from './dto/interview-distribute.dto';

@Controller('courses/:courseId/interviews')
@ApiTags('courses interviews')
@UseGuards(DefaultGuard, CourseGuard, RoleGuard)
export class InterviewsController {
  constructor(
    private interviewsService: InterviewsService,
    private interviewFeedbackService: InterviewFeedbackService,
    private courseTasksService: CourseTasksService,
    private stageInterviewsService: StageInterviewsService,
    private userNotificationsService: UserNotificationsService,
  ) {}

  @Get()
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({ type: [InterviewDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiQuery({ name: 'disabled', required: false })
  @ApiQuery({ name: 'types', required: false })
  @ApiOperation({ operationId: 'getInterviews' })
  public async getInterviews(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('disabled') disabled?: boolean,
    @Query('types', new ParseArrayPipe({ optional: true })) types?: string[],
  ) {
    const data = await this.interviewsService.getAll(courseId, {
      disabled,
      types: types as TaskType[],
    });
    return data.map(item => new InterviewDto(item));
  }

  @Get('/comments')
  @ApiOkResponse({ type: [InterviewCommentDto] })
  @ApiForbiddenResponse()
  @ApiOperation({ operationId: 'getStageInterviewsCommentToStudent' })
  @RequiredRoles([CourseRole.Student, Role.Admin])
  public async getStageInterviewsCommentToStudent(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: CurrentRequest,
  ) {
    const { user } = req;
    const studentId = user.courses[courseId]?.studentId;

    if (!studentId) {
      if (!user.isAdmin) {
        throw new ForbiddenException(`You are not a student of course ${courseId}`);
      }

      return [];
    }

    const commentsToStudent = await this.interviewFeedbackService.getCourseStageInterviewsComment(courseId, studentId);
    return commentsToStudent;
  }

  @Get('/stage')
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  @ApiForbiddenResponse()
  @ApiOperation({ operationId: 'getStageInterviews' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async getStageInterviews(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.stageInterviewsService.findMany(courseId);
  }

  @Post('/stage')
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'createStageInterviews' })
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  public async createStageInterviews(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateStageInterviewsDto,
  ) {
    try {
      const result = await this.stageInterviewsService.createAutomatically(courseId, dto.noRegistration ?? false);

      await Promise.all(
        result.map(async pair => {
          try {
            const [interviewer, student] = await Promise.all([
              this.stageInterviewsService.queryMentorById(courseId, pair.mentorId),
              this.stageInterviewsService.queryStudentById(courseId, pair.studentId),
            ]);
            if (!interviewer || !student) return;
            await this.userNotificationsService.sendEventNotification({
              userId: student.userId,
              notificationId: 'interviewerAssigned',
              data: { interviewer },
            });
          } catch {
            // ignore notification failures, same as legacy
          }
        }),
      );
      return result;
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  @Get('/stage/interviewer/me/students')
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  @ApiForbiddenResponse()
  @ApiOperation({ operationId: 'getStageInterviewerStudents' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async getStageInterviewerStudents(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.stageInterviewsService.findByInterviewer(courseId, req.user.githubId);
  }

  @Post('/stage/interviewer/:interviewerGithubId/student/:studentGithubId')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ operationId: 'createStageInterviewPair' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async createStageInterviewPair(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('interviewerGithubId') interviewerGithubId: string,
    @Param('studentGithubId') studentGithubId: string,
  ) {
    const result = await this.stageInterviewsService.create(courseId, studentGithubId, interviewerGithubId);

    try {
      const [interviewer, student] = await Promise.all([
        this.stageInterviewsService.queryMentorByGithubId(courseId, interviewerGithubId),
        this.stageInterviewsService.queryStudentByGithubId(courseId, studentGithubId),
      ]);
      if (interviewer && student) {
        await this.userNotificationsService.sendEventNotification({
          userId: student.userId,
          notificationId: 'interviewerAssigned',
          data: { interviewer },
        });
      }
    } catch {
      // ignore notification failures, same as legacy
    }

    return { id: result?.id };
  }

  @Put('/stage/pairs/:interviewId')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'updateStageInterviewPair' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async updateStageInterviewPair(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('interviewId', ParseIntPipe) interviewId: number,
    @Body() dto: UpdateStageInterviewPairDto,
  ) {
    await this.stageInterviewsService.updateInterviewer(interviewId, dto.githubId);
    return {};
  }

  @Delete('/stage/pairs/:interviewId')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ operationId: 'cancelStageInterviewPair' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async cancelStageInterviewPair(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('interviewId', ParseIntPipe) interviewId: number,
  ) {
    return this.stageInterviewsService.cancel(interviewId);
  }

  @Get('/:interviewId')
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({ type: InterviewDto })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiParam({ name: 'courseId', type: Number })
  @ApiOperation({ operationId: 'getInterview' })
  public async getInterview(@Param('interviewId', ParseIntPipe) interviewId: number) {
    const data = await this.interviewsService.getById(interviewId);
    if (!data) {
      throw new NotFoundException(`Interview ${interviewId} doesn't exist`);
    }
    return new InterviewDto(data);
  }

  @Get('/:interviewId/pairs')
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({ type: [InterviewPairDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiParam({ name: 'courseId', type: Number })
  @ApiOperation({ operationId: 'getInterviewPairs' })
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  public async getInterviewPairs(@Param('interviewId', ParseIntPipe) interviewId: number) {
    const data = await this.interviewsService.getInterviewPairs(interviewId);
    return data;
  }

  @Post('/:interviewId/register')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'registerToInterview' })
  @RequiredRoles([CourseRole.Student], true)
  public async registerToInterview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('interviewId', ParseIntPipe) interviewId: number,
    @Req() req: CurrentRequest,
  ) {
    const { user } = req;
    const interview = await this.interviewsService.getById(interviewId);

    if (!interview) {
      throw new NotFoundException(`Interview ${interviewId} doesn't exist`);
    }
    if (interview.studentRegistrationStartDate && new Date() < interview.studentRegistrationStartDate) {
      throw new BadRequestException('Student registration is not available yet');
    }
    const taskInterviewStudent =
      interview.type === TaskType.StageInterview
        ? await this.interviewsService.registerStudentToStageInterview(courseId, user.githubId)
        : await this.interviewsService.registerStudentToInterview(courseId, interviewId, user.githubId);

    return new RegistrationInterviewDto(taskInterviewStudent);
  }

  @Post('/:courseTaskId/auto-distribute')
  @ApiOkResponse({ type: [InterviewDistributeResponseDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  @ApiOperation({ operationId: 'distributeInterviewPairs' })
  @RequiredRoles([CourseRole.Manager, Role.Admin])
  public async distribute(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Body() dto: InterviewDistributeDto,
  ) {
    const courseTask = await this.courseTasksService.getById(courseTaskId);

    if (!courseTask) {
      throw new BadRequestException('Not valid course task');
    }

    if (courseTask.isCreatingInterviewPairs) {
      throw new ConflictException('Course task is already being processed');
    }

    try {
      await this.courseTasksService.changeCourseTaskProcessing(courseTaskId, true);

      const result = await this.interviewsService.distributeInterviewPairs(courseId, courseTaskId, {
        clean: dto.clean,
        registrationEnabled: dto.registrationEnabled,
      });

      if (result === null || result.length === 0) {
        throw new BadRequestException('No interview pairs were created');
      }

      return result;
    } finally {
      await this.courseTasksService.changeCourseTaskProcessing(courseTaskId, false);
    }
  }

  @Get('/:interviewId/students/available')
  @ApiOkResponse({ type: [AvailableStudentDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getAvailableStudents' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async getAvailableStudents(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('interviewId', ParseIntPipe) interviewId: number,
  ) {
    const interview = await this.interviewsService.getById(interviewId);

    if (!interview) {
      throw new NotFoundException(`Interview ${interviewId} doesn't exist`);
    }
    if (interview.type === 'stage-interview') {
      return this.interviewsService.getStageInterviewAvailableStudents(courseId);
    }

    if (interview.type === 'interview') {
      return this.interviewsService.getInterviewRegisteredStudents(courseId, +interviewId);
    }

    throw new BadRequestException('Invalid interview id');
  }

  // use `type` as a way to differentiate between stage-interview and interview.
  @Get('/:interviewId/:type/feedback')
  @ApiOkResponse({ type: InterviewFeedbackDto })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getInterviewFeedback' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  public async getInterviewFeedback(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('interviewId', ParseIntPipe) interviewId: number,
    @Param('type') type: 'stage-interview' | 'interview',
    @Req() req: CurrentRequest,
  ) {
    const { user } = req;

    if (type !== 'stage-interview') {
      throw new BadRequestException('Only stage interviews are supported now.');
    }

    const interview = await this.interviewFeedbackService.getStageInterviewFeedback(interviewId, user.githubId);

    return new InterviewFeedbackDto(interview);
  }

  @Post('/:interviewId/:type/feedback')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'createInterviewFeedback' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager], true)
  public async createInterviewFeedback(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('interviewId', ParseIntPipe) interviewId: number,
    @Param('type') type: 'stage-interview' | 'interview',
    @Body() dto: PutInterviewFeedbackDto,
    @Req() req: CurrentRequest,
  ) {
    const { user } = req;

    const interviewerId = user.courses[courseId]?.mentorId;
    if (!interviewerId) {
      throw new ForbiddenException(`You are not a mentor of course ${courseId}`);
    }

    if (type !== 'stage-interview') {
      throw new BadRequestException('Only stage interviews are supported now.');
    }

    await this.interviewFeedbackService.upsertInterviewFeedback({
      interviewId,
      dto,
      interviewerId,
    });
  }
}
