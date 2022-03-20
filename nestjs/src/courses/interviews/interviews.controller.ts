import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, DefaultGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from '../../constants';
import { InterviewDto } from './dto';
import { InterviewsService } from './interviews.service';

@Controller('courses/:courseId/interviews')
@ApiTags('courses interviews')
@UseGuards(DefaultGuard, CourseGuard)
export class InterviewsController {
  constructor(private courseTasksService: InterviewsService) {}

  @Get()
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseInterceptors(CacheInterceptor)
  @ApiOkResponse({ type: [InterviewDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getInterviews' })
  public async getOne(@Param('courseId', ParseIntPipe) courseId: number) {
    const data = await this.courseTasksService.getAll(courseId);
    return data.map(item => new InterviewDto(item));
  }
}
