import { Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DefaultGuard } from 'src/auth';
import { ConsentDto } from './dto/consent.dto';
import { ResumeDto } from './dto/resume.dto';
import { OpportunitiesService } from './opportunities.service';

@Controller('opportunities')
@ApiTags('opportunities')
export class OpportunitiesController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Get('/:githubId/resume')
  @ApiOperation({ operationId: 'getResume' })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: ResumeDto })
  @UseGuards(DefaultGuard)
  public async getResume(@Param('githubId') githubId: string) {
    const data = await this.opportunitiesService.getResumeByGithubId(githubId);
    if (data == null) {
      throw new NotFoundException('Resume not found');
    }
    const { resume, students, gratitudes, feedbacks } = data;
    return new ResumeDto(resume, students, gratitudes, feedbacks);
  }

  @Get('/:githubId/consent')
  @ApiOperation({ operationId: 'getConsent' })
  @ApiOkResponse({ type: ConsentDto })
  @UseGuards(DefaultGuard)
  public async getConsent(@Param('githubId') githubId: string) {
    const value = await this.opportunitiesService.getConsent(githubId);
    if (value == null) {
      throw new NotFoundException('Resume not found');
    }
    return new ConsentDto(value);
  }

  @Post('/:githubId/consent')
  @ApiOperation({ operationId: 'createConsent' })
  @ApiOkResponse({ type: ConsentDto })
  @UseGuards(DefaultGuard)
  public async createConsent(@Param('githubId') githubId: string) {
    const data = await this.opportunitiesService.createConsent(githubId);
    return new ConsentDto(data);
  }

  @Delete('/:githubId/consent')
  @ApiOperation({ operationId: 'deleteConsent' })
  @ApiOkResponse({ type: ConsentDto })
  @UseGuards(DefaultGuard)
  public async deleteConsent(@Param('githubId') githubId: string) {
    const data = await this.opportunitiesService.deleteConsent(githubId);
    return new ConsentDto(data);
  }

  @Get('/public/:uuid')
  @ApiOperation({ operationId: 'getPublicResume' })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: ResumeDto })
  public async getPublicResume(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const data = await this.opportunitiesService.getResumeByUuid(uuid);
    if (data == null) {
      throw new NotFoundException('Resume not found');
    }
    const { resume, students, gratitudes, feedbacks } = data;
    return new ResumeDto(resume, students, gratitudes, feedbacks);
  }
}
