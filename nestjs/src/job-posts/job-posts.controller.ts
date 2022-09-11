import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../auth';
import { CreateJobPostDto, JobPostDto } from './dto';
import { JobPostsService } from './job-posts.service';

@Controller('jobs-posts')
@ApiTags('job-posts')
@UseGuards(DefaultGuard)
export class JobPostsController {
  constructor(private readonly service: JobPostsService) {}

  @Post('/')
  @ApiOperation({ operationId: 'createJobPost' })
  @ApiOkResponse({ type: JobPostDto })
  public async create(@Req() request: CurrentRequest, @Body() dto: CreateJobPostDto) {
    const data = await this.service.create(dto, request.user.id);
    return new JobPostDto(data);
  }

  @Get('/')
  @ApiOperation({ operationId: 'getJobPosts' })
  @ApiOkResponse({ type: [JobPostDto] })
  public async getAvailable(@Req() request: CurrentRequest) {
    const items = await this.service.getAvailable(request.user.id);
    return items.map(item => new JobPostDto(item));
  }

  @Get('/my')
  @ApiOperation({ operationId: 'getMyJobPosts' })
  @ApiOkResponse({ type: [JobPostDto] })
  public async getMY(@Req() request: CurrentRequest) {
    const items = await this.service.getAvailable(request.user.id);
    return items.map(item => new JobPostDto(item));
  }
}
