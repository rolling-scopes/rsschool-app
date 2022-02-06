import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredAppRoles, Role, RoleGuard } from 'src/auth';
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
  @RequiredAppRoles([Role.Admin]) // TODO: discuss with @apalchys
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
