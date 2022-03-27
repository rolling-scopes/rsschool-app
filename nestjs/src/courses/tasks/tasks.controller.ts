import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CourseGuard, DefaultGuard, RequiredRoles, Role } from '../../auth';
import { CheckTasksDeadlineDto } from './dto/check-tasks-deadline';
import { TasksService } from './tasks.service';

@Controller('tasks')
@ApiTags('courses tasks')
@UseGuards(DefaultGuard, CourseGuard)
export class TasksController {
  private readonly logger = new Logger('tasks');

  constructor(private tasksService: TasksService, private notificationService: UserNotificationsService) {}

  @Post('/notify/changes')
  @ApiOperation({ operationId: 'notifyTasksDeadlines' })
  @ApiForbiddenResponse()
  @RequiredRoles([Role.Admin])
  public async notifyTasksDeadlines(@Body() dto: CheckTasksDeadlineDto) {
    const students = await this.tasksService.getPendingTasksDeadline(dto.deadlineInHours);

    for (const [userId, tasks] of students) {
      try {
        await this.notificationService.sendEventNotification({
          data: { tasks },
          notificationId: 'taskDeadline',
          userId,
        });
      } catch (e) {
        this.logger.log({ message: (e as Error).message, userId });
      }
    }
  }
}
