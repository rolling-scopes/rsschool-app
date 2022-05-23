import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { ApplicantResumeDto } from './dto/applicant-resume.dto';
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
  public async getResume(@Req() req: CurrentRequest, @Param('githubId') githubId: string) {
    if (githubId !== req.user.githubId) {
      // TODO: limit access to own CV for now
      throw new ForbiddenException('No access to resume');
    }
    const data = await this.opportunitiesService.getResumeByGithubId(githubId);
    if (data == null) {
      throw new NotFoundException('Resume not found');
    }
    const { resume, students, gratitudes, feedbacks } = data;
    return new ResumeDto(resume, students, gratitudes, feedbacks);
  }

  @Get('/consent')
  @ApiOperation({ operationId: 'getConsent' })
  @ApiOkResponse({ type: ConsentDto })
  @UseGuards(DefaultGuard)
  public async getConsent(@Req() req: CurrentRequest) {
    const value = await this.opportunitiesService.getConsent(req.user.githubId);
    if (value == null) {
      throw new NotFoundException('Resume not found');
    }
    return new ConsentDto(value);
  }

  @Post('/consent')
  @ApiOperation({ operationId: 'createConsent' })
  @ApiOkResponse({ type: ConsentDto })
  @UseGuards(DefaultGuard)
  public async createConsent(@Req() req: CurrentRequest) {
    const data = await this.opportunitiesService.createConsent(req.user.githubId);
    return new ConsentDto(data);
  }

  @Delete('/consent')
  @ApiOperation({ operationId: 'deleteConsent' })
  @ApiOkResponse({ type: ConsentDto })
  @UseGuards(DefaultGuard)
  public async deleteConsent(@Req() req: CurrentRequest) {
    const data = await this.opportunitiesService.deleteConsent(req.user.githubId);
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

  @Get('/applicants')
  @ApiOperation({ operationId: 'getApplicants' })
  @ApiOkResponse({ type: [ApplicantResumeDto] })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  public async getApplicants() {
    const data = await this.opportunitiesService.getApplicantResumes();
    return data.map(item => new ApplicantResumeDto(item));
  }
}
