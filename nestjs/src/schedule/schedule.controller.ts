import { Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
@ApiTags('schedule')
@UseGuards(DefaultGuard, RoleGuard)
@RequiredRoles([Role.Admin])
export class ScheduleController {
  private readonly logger = new Logger('schedule');

  constructor(private scheduleService: ScheduleService, private notificationService: UserNotificationsService) {}

  @Post('/notify/changes')
  @ApiOperation({ operationId: 'notifyScheduleChanges' })
  @ApiForbiddenResponse()
  public async notifyScheduleChanges() {
    const recipients = await this.scheduleService.getChangedCoursesRecipients();
    Promise.resolve().then(
      () =>
        new Promise(async () => {
          this.logger.log({ message: 'processing recipients notifications...' });

          for (const [userId, courses] of recipients) {
            try {
              await this.notificationService.sendEventNotification({
                data: { courses },
                notificationId: 'courseScheduleChange',
                userId,
              });
            } catch (e) {
              this.logger.log({ message: (e as Error).message, userId });
            }
          }
        }),
    );
  }
}
