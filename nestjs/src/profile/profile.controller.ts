import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  NotFoundException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { CoursesService } from 'src/courses/courses.service';
import { CurrentRequest } from 'src/auth/auth.service';
import { EndorsementService } from './endorsement.service';
import { ProfileService } from './profile.service';
import { ProfileInfoService } from './profile-info.service';
import { ProfileCourseDto, UpdateUserDto, UpdateProfileInfoDto, ProfileInfoExtendedDto } from './dto';
import { ProfileWithCvDto } from './dto/profile.dto';
import { PersonalProfileDto } from './dto/personal-profile.dto';
import { EndorsementDto, EndorsementDataDto } from './dto/endorsement.dto';

@Controller('profile')
@ApiTags('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly profileInfoService: ProfileInfoService,
    private readonly endorsementService: EndorsementService,
    private readonly coursesService: CoursesService,
  ) {}

  @Get(':username/courses')
  @ApiOperation({ operationId: 'getUserCourses' })
  @ApiOkResponse({ type: [ProfileCourseDto] })
  @UseGuards(DefaultGuard)
  public async getCourses(
    @Req() req: CurrentRequest,
    @Param('username') username: string,
  ): Promise<ProfileCourseDto[]> {
    const user = req.user;
    if (user.isAdmin) {
      const data = await this.coursesService.getAll();
      return data.map(course => new ProfileCourseDto(course));
    }
    if (username !== user.githubId && username !== 'me') {
      throw new ForbiddenException();
    }
    const data = await this.profileService.getCourses(user);
    return data.map(course => new ProfileCourseDto(course));
  }

  @Post('/user')
  @ApiOperation({ operationId: 'updateUser' })
  @ApiBody({ type: UpdateUserDto })
  @UseGuards(DefaultGuard)
  public async updateUser(@Req() req: CurrentRequest, @Body() dto: UpdateUserDto) {
    const { user } = req;

    await this.profileService.updateUser(user.id, dto);
  }

  @Get('/info')
  @ApiQuery({ name: 'githubId', required: false })
  @ApiOperation({ operationId: 'getProfileInfo' })
  @ApiResponse({ type: ProfileInfoExtendedDto })
  @UseGuards(DefaultGuard)
  public async getProfileInfo(@Req() req: CurrentRequest, @Query('githubId') githubId?: string) {
    const { githubId: requestorGithubId } = req.user;
    const requestedGithubId = githubId ?? requestorGithubId;

    if (!requestorGithubId && !requestedGithubId) {
      throw new NotFoundException(`profile doesn't exist`);
    }

    return this.profileInfoService.getProfileInfo(requestedGithubId, requestorGithubId, req.user);
  }

  @Patch('/info')
  @ApiOperation({ operationId: 'updateProfileInfoFlat' })
  @ApiBody({ type: UpdateProfileInfoDto })
  @UseGuards(DefaultGuard)
  public async updateProfileFlatInfo(@Req() req: CurrentRequest, @Body() dto: UpdateProfileInfoDto) {
    const { user } = req;

    await this.profileInfoService.updateProfileFlat(user.id, dto);
  }

  @Get(':username')
  @ApiOperation({ operationId: 'getProfile' })
  @ApiResponse({ type: ProfileWithCvDto })
  @UseGuards(DefaultGuard)
  public async getProfile(@Param('username') githubId: string) {
    const profile = await this.profileService.getProfile(githubId);

    return new ProfileWithCvDto(profile);
  }

  @Get(':username/personal')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'getPersonalProfile' })
  @ApiResponse({ type: PersonalProfileDto })
  public async getPersonalProfile(@Param('username') githubId: string) {
    const user = await this.profileService.getPersonalProfile(githubId);

    return new PersonalProfileDto(user);
  }

  @Get(':username/endorsement')
  @ApiOperation({ operationId: 'getEndorsement' })
  @ApiResponse({ type: EndorsementDto })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  public async getEndorsement(@Param('username') githubId: string) {
    const endorsement = await this.endorsementService.getEndorsement(githubId);
    return new EndorsementDto(endorsement);
  }

  @Get(':username/endorsement-data')
  @ApiOperation({ operationId: 'getEndorsementData' })
  @ApiResponse({ type: EndorsementDataDto })
  @UseGuards(DefaultGuard)
  public async getEndorsementData(@Param('username') githubId: string) {
    const data = await this.endorsementService.getEndorsementData(githubId);
    return new EndorsementDataDto(data);
  }

  @Delete(':username')
  @ApiOperation({ operationId: 'obfuscateProfile' })
  @UseGuards(DefaultGuard, RoleGuard)
  public async obfuscateProfile(@Param('username') githubId: string) {
    await this.profileService.obfuscateProfile(githubId);
  }
}
