import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard } from 'src/auth';
import { ResumeDto } from './dto/resume.dto';
import { OpportunitiesService } from './opportunities.service';

@Controller('opportunities')
@ApiTags('opportunities')
@UseGuards(DefaultGuard)
export class OpportunitiesController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Get('/:githubId/resume')
  @ApiOperation({ operationId: 'getResume' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: ResumeDto })
  public async getResume(@Param('githubId') githubId: string) {
    const { resume, students, gratitude, feedbacks } = await this.opportunitiesService.getResume(githubId);
    return new ResumeDto(resume, students, gratitude, feedbacks);
  }
}
