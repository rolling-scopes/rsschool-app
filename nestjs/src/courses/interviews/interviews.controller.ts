import {
  BadRequestException,
  Body,
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
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiBadRequestResponse,
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
import { TaskType } from '@entities/task';
import { InterviewFeedbackService } from './interviewFeedback.service';
import { InterviewFeedbackDto } from './dto/get-interview-feedback.dto';
import { PutInterviewFeedbackDto } from './dto/put-interview-feedback.dto';
import { RegistrationInterviewDto } from './dto/registration-interview.dto';
import { InterviewPairDto } from './dto/interview-pair.dto';

@Controller('courses/:courseId/interviews')
@ApiTags('courses interviews')
@UseGuards(DefaultGuard, CourseGuard, RoleGuard)
export class InterviewsController {
  constructor(
    private interviewsService: InterviewsService,
    private interviewFeedbackService: InterviewFeedbackService,
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
