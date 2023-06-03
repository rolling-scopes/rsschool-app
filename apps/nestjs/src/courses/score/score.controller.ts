import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { CourseGuard, DefaultGuard } from 'src/auth';
import { DEFAULT_CACHE_TTL } from 'src/constants';

import { ScoreQueryDto, OrderDirection, OrderField } from './dto/score-query.dto';
import { ScoreService } from './score.service';
import { ScoreDto } from './dto/score.dto';

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
}
