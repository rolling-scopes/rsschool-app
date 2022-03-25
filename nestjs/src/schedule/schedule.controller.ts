import { Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
@ApiTags('schedule')
@UseGuards(DefaultGuard, RoleGuard)
@RequiredRoles([Role.Admin])
export class ScheduleController {
  private readonly logger = new Logger('schedule');

  constructor(private scheduleService: ScheduleService, private notificationService: NotificationsService) {}

  @Post('/notify/changes')
  @ApiOperation({ operationId: 'notifyScheduleChanges' })
  @ApiForbiddenResponse()
  public async notifyScheduleChanges() {
    const students = await this.scheduleService.getChangedStudentsCourses();

    for (const [userId, courses] of students) {
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
  }
}
