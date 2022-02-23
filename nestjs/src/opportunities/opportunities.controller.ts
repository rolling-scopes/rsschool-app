import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard } from 'src/auth';
import { ResumeDto } from './dto/resume.dto';
import { OpportunitiesService } from './opportunities.service';

@Controller('opportunities')
@ApiTags('opportunities')
export class OpportunitiesController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Get('/:githubId/resume')
  @ApiOperation({ operationId: 'getResume' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: ResumeDto })
  @UseGuards(DefaultGuard)
  public async getResume(@Param('githubId') githubId: string) {
    const { resume, students, gratitude, feedbacks } = await this.opportunitiesService.getResumeByGithubId(githubId);
    return new ResumeDto(resume, students, gratitude, feedbacks);
  }

  @Get('/public/:uuid')
  @ApiOperation({ operationId: 'getPublicResume' })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOkResponse({ type: ResumeDto })
  public async getPublicResume(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const { resume, students, gratitude, feedbacks } = await this.opportunitiesService.getResumeByUuid(uuid);
    return new ResumeDto(resume, students, gratitude, feedbacks);
  }
}
