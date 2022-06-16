import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CheckScheduleChangesDto } from './dto/check-schedule-changes';
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
  public async notifyScheduleChanges(@Body() dto: CheckScheduleChangesDto) {
    const recipients = await this.scheduleService.getChangedCoursesRecipients(dto.lastHours);
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
