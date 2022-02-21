import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ApproveMentorDto } from './dto/approve-mentor.dto';
import { RegistryService } from './registry.service';

@Controller('registry')
@ApiTags('registry')
@UseGuards(DefaultGuard, RoleGuard)
export class RegistryController {
  constructor(private mentorsService: RegistryService, private notificationService: NotificationsService) {}

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

    await this.notificationService.sendNotification({
      data: notificationData,
      notificationId: 'mentorRegistrationApproval',
      userId: user.id,
    });
  }
}
