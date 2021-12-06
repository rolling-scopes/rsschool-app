import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DefaultGuard } from 'src/auth';
import { CurrentRequest } from '../auth/auth.service';
import { ProfileCourseDto } from './dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@ApiTags('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username/courses')
  @UseGuards(DefaultGuard)
  @ApiSecurity('cookieAuth')
  @ApiOperation({ operationId: 'getCourses' })
  @ApiOkResponse({ type: [ProfileCourseDto] })
  async getCourses(@Req() req: CurrentRequest, @Param('username') username: string): Promise<ProfileCourseDto[]> {
    const user = username === 'me' ? req.user?.githubId : username;
    const data = await this.profileService.getCourses(user);
    return data;
  }
}
