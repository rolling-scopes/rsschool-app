import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseIntPipe, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Response } from 'express';
import { parseAsync, transforms } from 'json2csv';

import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { DEFAULT_CACHE_TTL } from 'src/constants';

import { ScoreQueryDto, OrderDirection, OrderField } from './dto/score-query.dto';
import { ScoreService } from './score.service';
import { ScoreDto, ScoreStudentDto } from './dto/score.dto';

@Controller('course/:courseId/students/score')
@ApiTags('students score')
export class ScoreController {
  constructor(private scoreService: ScoreService) {}

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

  @Get('/csv')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Supervisor, CourseRole.Manager, Role.Admin], true)
  @ApiOperation({ operationId: 'getScoreCsv' })
  @ApiForbiddenResponse()
  @ApiQuery({ name: 'cityName', required: false, type: String })
  @ApiQuery({ name: 'mentor.githubId', required: false, type: String })
  public async getScoreCsv(
    @Req() req: CurrentRequest,
    @Res() res: Response,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('cityName') cityName?: string,
    @Query('mentor.githubId') mentor?: string,
  ) {
    const user = req.user;
    const isCourseManager = user.courses[courseId]?.roles?.includes(CourseRole.Manager);

    const filters = {
      activeOnly: false,
      cityName,
      'mentor.githubId': mentor,
    };

    const result = await this.scoreService.getStudentsScoreForExport(courseId, filters, {
      includeContacts: (user.isAdmin || user.isHirer) ?? false,
      includeCertificate: (user.isAdmin || user.isHirer || isCourseManager) ?? false,
    });
    const csv = await parseAsync(result, { transforms: [transforms.flatten()] });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', `filename="score.csv"`);
    res.end(csv);
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
