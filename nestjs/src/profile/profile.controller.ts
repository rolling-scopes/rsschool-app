import { Controller, ForbiddenException, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard } from 'src/auth';
import { CoursesService } from 'src/courses/courses.service';
import { CurrentRequest } from '../auth/auth.service';
import { ProfileCourseDto } from './dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@ApiTags('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private readonly coursesService: CoursesService) {}

  @Get(':username/courses')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'getUserCourses' })
  @ApiOkResponse({ type: [ProfileCourseDto] })
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
}
