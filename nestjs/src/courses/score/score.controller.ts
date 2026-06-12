import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Logger, Param, ParseArrayPipe, ParseIntPipe, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { WriteScoreService } from './write-score.service';
import { CreateMultipleScoresItemDto, OperationResultDto } from './dto/create-multiple-scores.dto';
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

  @Post('/task/:courseTaskId/multiple')
  @UseGuards(DefaultGuard, CourseGuard, RoleGuard)
  @RequiredRoles([CourseRole.TaskOwner, CourseRole.Mentor, CourseRole.Manager, Role.Admin], true)
  @ApiOperation({ operationId: 'createMultipleScores' })
  @ApiBody({ type: [CreateMultipleScoresItemDto] })
  @ApiOkResponse({ type: [OperationResultDto] })
  public async createMultipleScores(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Body(new ParseArrayPipe({ items: CreateMultipleScoresItemDto })) inputData: CreateMultipleScoresItemDto[],
  ): Promise<OperationResultDto[]> {
    const result: OperationResultDto[] = [];

    for (const item of inputData) {
      try {
        this.logger.log(item.studentGithubId);

        const data = {
          studentGithubId: item.studentGithubId,
          courseTaskId,
          score: Math.round(Number(item.score)),
          comment: (item.comment || '').substring(0, 8 * 1024),
          githubPrUrl: item.githubPrUrl || '',
        };

        const { studentGithubId } = data;

        const student = await this.scoreService.getStudentForScore(courseId, studentGithubId);

        if (student == null) {
          result.push({ status: 'skipped', value: `no student: ${studentGithubId}` });
          continue;
        }

        const authorId = req.user?.id ?? 0;

        const { created } = await this.writeScoreService.saveScoreWithStatus(
          Number(student.id),
          Number(courseTaskId),
          {
            authorId,
            comment: data.comment,
            score: data.score,
            githubPrUrl: data.githubPrUrl,
          },
        );

        if (created) {
          result.push({ status: 'created', value: undefined });
        } else {
          result.push({ status: 'updated', value: undefined });
        }
      } catch (e) {
        result.push({ status: 'failed', value: (e as Error).message });
      }
    }

    return result;
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
