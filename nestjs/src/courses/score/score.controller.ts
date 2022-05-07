import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
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
import { Repository } from 'typeorm';

import { Student } from '@entities/student';

import { CourseGuard, DefaultGuard } from 'src/auth';
import { DEFAULT_CACHE_TTL } from 'src/constants';

import { GetScoreQueryDto, OrderDirection, OrderField } from './dto/GetScoreQuery.dto';
import { ScoreService } from './score.service';
import { ScoreDto } from './dto/Score.dto';

@Controller('course/:courseId/students/score')
@ApiTags('students score')
export class ScoreController {
  constructor(@InjectRepository(Student) readonly studentRepository: Repository<Student>) {}

  @Get('/')
  @UseGuards(DefaultGuard, CourseGuard)
  @ApiOperation({ operationId: 'getScore' })
  @ApiOkResponse({ type: ScoreDto })
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  public async getScore(@Query() query: GetScoreQueryDto, @Param('courseId', ParseIntPipe) courseId: number) {
    const orderBy: OrderField = query.orderBy ?? 'totalScore';
    const orderDirection: OrderDirection = (query.orderDirection?.toUpperCase() as OrderDirection) ?? 'DESC';
    const page = parseInt(query.current);
    const limit = parseInt(query.pageSize);

    const filter = {
      ...query,
      activeOnly: query.activeOnly === 'true',
    };

    const scoreService = new ScoreService(this.studentRepository);
    const score = await scoreService.getScore({
      courseId,
      filter,
      orderBy: { field: orderBy, direction: orderDirection },
      page,
      limit,
    });

    return score;
  }
}
