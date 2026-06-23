import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

import { CourseGuard, CurrentRequest, DefaultGuard } from 'src/auth';
import { isAdmin, isManager, isTaskOwner } from '@entities/session';
import { WriteScoreService } from './write-score.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ConfigService } from 'src/config';
import { CreateSingleScoreDto } from './dto/create-single-score.dto';
import { DEFAULT_CACHE_TTL } from 'src/constants';

import { ScoreQueryDto, OrderDirection, OrderField } from './dto/score-query.dto';
import { ScoreService } from './score.service';
import { ScoreDto, ScoreStudentDto } from './dto/score.dto';

@Controller('course/:courseId/students/score')
@ApiTags('students score')
export class ScoreController {
  private readonly logger = new Logger('ScoreController');

  constructor(
    private scoreService: ScoreService,
    private writeScoreService: WriteScoreService,
    private notificationsService: UserNotificationsService,
    private configService: ConfigService,
  ) {}

  @Get('/')
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getScore' })
  @ApiOkResponse({ type: ScoreDto })
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  public async getScore(@Query() query: ScoreQueryDto, @Param('courseId', ParseIntPipe) courseId: number) {
    const orderBy: OrderField = query.orderBy ?? 'totalScore';
    const orderDirection: OrderDirection = (query.orderDirection?.toUpperCase() as OrderDirection) ?? 'DESC';
    const page = parseInt(query.current);
    const limit = parseInt(query.pageSize);

    const score = await this.scoreService.getScore({
      courseId,
      filter: query,
      orderBy: { field: orderBy, direction: orderDirection },
      page,
      limit,
    });

    return score;
  }

  @Post('/:githubId/task/:courseTaskId')
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'createSingleScore' })
  @ApiBody({ type: CreateSingleScoreDto })
  @ApiOkResponse()
  public async createSingleScore(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Param('githubId') githubId: string,
    @Body() inputData: CreateSingleScoreDto,
  ) {
    const session = req.user;
    const student = await this.scoreService.getStudentForScore(courseId, githubId);
    if (student == null) {
      throw new BadRequestException('not valid student');
    }

    if (Number.isNaN(Number(inputData.score))) {
      throw new BadRequestException('no score');
    }
    const data = {
      score: Math.round(Number(inputData.score)),
      comment: (inputData.comment || '').substring(0, 8 * 1024),
      githubPrUrl: inputData.githubPrUrl,
    };

    const authorId = session.id;
    const courseTask = await this.scoreService.getCourseTaskWithCourse(courseTaskId);
    if (courseTask == null) {
      throw new BadRequestException('not valid course task');
    }

    const mentor = await this.scoreService.getMentorByUserId(courseId, authorId);

    const isNotTaskOwner = !isTaskOwner(session, courseId);
    if (mentor == null && !isAdmin(session) && !isManager(session, courseId) && isNotTaskOwner) {
      throw new BadRequestException('not valid submitter');
    }

    const previousScore = await this.writeScoreService.saveScore(student.id, courseTask.id, { ...data, authorId });

    try {
      await this.notificationsService.sendEventNotification({
        userId: student.user.id,
        notificationId: 'taskGrade',
        data: {
          previousScore,
          courseTask,
          score: data.score,
          comment: data.comment,
          resultLink: `${this.configService.host}/course/student/dashboard?course=${courseTask.course.alias}&statType=completed`,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to publish notification ${(e as Error).message}`);
    }
  }

  @Get('/:githubId')
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getStudentScore' })
  @ApiOkResponse({ type: ScoreStudentDto })
  public async getStudentScore(@Param('courseId', ParseIntPipe) courseId: number, @Param('githubId') githubId: string) {
    const studentScore = await this.scoreService.getStudentScore({ githubId, courseId });
    return studentScore;
  }
}
