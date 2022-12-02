import {
  BadRequestException,
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CourseGuard, CourseRole, DefaultGuard, RequiredRoles, RoleGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from '../../constants';
import { InterviewDto } from './dto';
import { AvailableStudentDto } from './dto/available-student.dto';
import { InterviewsService } from './interviews.service';
import { TaskType } from '@entities/task';

@Controller('courses/:courseId/interviews')
@ApiTags('courses interviews')
@UseGuards(DefaultGuard, CourseGuard, RoleGuard)
export class InterviewsController {
  constructor(private courseTasksService: InterviewsService) {}

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
    const data = await this.courseTasksService.getAll(courseId, {
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
    const data = await this.courseTasksService.getById(interviewId);
    if (!data) {
      throw new NotFoundException(`Interview ${interviewId} doesn't exist`);
    }
    return new InterviewDto(data);
  }

  @Get('/:interviewId/students/available')
  @ApiOkResponse({ type: [AvailableStudentDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getAvailableStudents' })
  @RequiredRoles([CourseRole.Mentor, CourseRole.Supervisor, CourseRole.Manager])
  public async getAvailableStudents(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('interviewId', ParseIntPipe) interviewId: number,
  ) {
    const interview = await this.courseTasksService.getById(interviewId);

    if (!interview) {
      throw new NotFoundException(`Interview ${interviewId} doesn't exist`);
    }
    if (interview.type === 'stage-interview') {
      return this.courseTasksService.getStageInterviewAvailableStudents(courseId);
    }

    if (interview.type === 'interview') {
      return this.courseTasksService.getInterviewRegisteredStudents(courseId, +interviewId);
    }

    throw new BadRequestException('Invalid interview id');
  }
}
