import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ApproveMentorDto } from './dto/approve-mentor.dto';
import { MentorRegistryDto } from './dto/mentor-registry.dto';
import { RegistryService } from './registry.service';

@Controller('registry')
@ApiTags('registry')
@UseGuards(DefaultGuard, RoleGuard)
export class RegistryController {
  constructor(private mentorsService: RegistryService, private notificationService: UserNotificationsService) {}

  @Put('mentor/:githubId')
  @ApiOperation({ operationId: 'approveMentor' })
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOkResponse()
  public async approveMentor(@Param('githubId') githubId: string, @Body() body: ApproveMentorDto) {
    const { preselectedCourses } = body;

    const [user, notificationData] = await Promise.all([
      this.mentorsService.approveMentor(githubId, preselectedCourses),
      this.mentorsService.buildMentorApprovalData(preselectedCourses),
    ]);

    await this.notificationService.sendEventNotification({
      data: notificationData,
      notificationId: 'mentorRegistrationApproval',
      userId: user.id,
    });
  }

  @Get('mentors')
  @ApiOperation({ operationId: 'getMentorRegistries' })
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOkResponse({ type: [MentorRegistryDto] })
  public async getMentorRegistries(@Req() req: CurrentRequest) {
    if (req.user.isAdmin) {
      const data = await this.mentorsService.findAllMentorRegistries();
      return data.map(el => new MentorRegistryDto(el));
    } else {
      const coursesIds = Object.entries(req.user.courses)
        .filter(([_, value]) => value.roles.includes(CourseRole.Manager) || value.roles.includes(CourseRole.Supervisor))
        .map(([key]) => Number(key));
      const data = await this.mentorsService.findMentorRegistriesByCourseIds(coursesIds);
      return data.map(el => new MentorRegistryDto(el));
    }
  }
}
