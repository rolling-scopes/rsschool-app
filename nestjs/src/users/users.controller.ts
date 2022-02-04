import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentRequest, DefaultGuard } from 'src/auth';

import { UpdateNotificationUserSettingsDto } from './dto/update-notification-user-settings.dto';
import { NotificationUserSettingsDto } from './dto/notification-user-settings.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('/notifications')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'getUserNotifications' })
  @ApiOkResponse({ type: [NotificationUserSettingsDto] })
  public async getUserNotifications(@Req() req: CurrentRequest) {
    const notifications = await this.notificationsService.getUserNotificationSettings(
      req.user.id,
      AuthUser.getCourseDistinctRoles(req.user),
    );

    return notifications.map(notification => new NotificationUserSettingsDto(notification));
  }

  @Put('/notifications')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'updateUserNotifications' })
  @ApiOkResponse()
  @ApiBody({ type: [UpdateNotificationUserSettingsDto] })
  public async updateUserNotifications(@Req() req: CurrentRequest, @Body() dto: UpdateNotificationUserSettingsDto[]) {
    return await this.notificationsService.saveUserNotificationSettings(req.user.id, dto);
  }
}
