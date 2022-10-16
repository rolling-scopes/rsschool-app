import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  Req,
  UseGuards,
  Body,
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
import { StatusDto } from './dto/status.dto';
import { VisibilityDto } from './dto/visibility.dto';
import { OpportunitiesService } from './opportunities.service';
import { Resume } from '@entities/resume';

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

  @Patch('/:githubId/resume')
  @ApiOperation({ operationId: 'saveResume' })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: Resume })
  @UseGuards(DefaultGuard)
  // TODO: deal with 500 status code validation issue on assigning dto FormDataDto type + @Body() decorator
  public async saveResume(@Req() req: CurrentRequest, @Param('githubId') githubId: string, @Body() dto: any) {
    if (githubId !== req.user.githubId) {
      throw new ForbiddenException('No access to resume');
    }
    const data = await this.opportunitiesService.saveResume(githubId, dto);
    if (data == null) {
      throw new NotFoundException('Resume not found');
    }
    return data;
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

  @Post('/prolong')
  @ApiOperation({ operationId: 'prolong' })
  @ApiOkResponse({ type: StatusDto })
  @UseGuards(DefaultGuard)
  public async prolong(@Req() req: CurrentRequest) {
    const data = await this.opportunitiesService.prolong(req.user.githubId);
    return new StatusDto(data);
  }

  @Post('/visibility')
  @ApiOperation({ operationId: 'setVisibility' })
  @ApiOkResponse({ type: VisibilityDto })
  @UseGuards(DefaultGuard)
  public async setVisibility(@Req() req: CurrentRequest, @Body('isHidden') isHidden: boolean) {
    const data = await this.opportunitiesService.setVisibility(req.user.githubId, !isHidden);
    return new VisibilityDto(data);
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
