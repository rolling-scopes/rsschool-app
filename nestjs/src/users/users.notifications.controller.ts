import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { Response } from 'express';
import { UpdateNotificationUserSettingsDto } from './dto/update-notification-user-settings.dto';
import { NotificationUserSettingsDto, UserNotificationsDto } from './dto/notification-user-settings.dto';
import { NotificationConnectionExistsDto } from './dto/notification-connection-exists.dto';
import { UpsertNotificationConnectionDto } from './dto/upsert-notification-connection.dto';
import { NotificationConnectionDto } from './dto/notification-connection.dto';
import { NotificationChannelId } from '@entities/notificationChannel';
import { UserNotificationsService } from './users.notifications.service';
import { UsersService } from './users.service';

@Controller('users/notifications')
@ApiTags('users')
@UseGuards(DefaultGuard)
export class UsersNotificationsController {
  constructor(private userNotificationsService: UserNotificationsService, private userService: UsersService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getUserNotifications' })
  @ApiOkResponse({ type: UserNotificationsDto })
  public async getUserNotifications(@Req() req: CurrentRequest) {
    const {
      user: { id },
    } = req;
    const [notifications, connections, profile] = await Promise.all([
      this.userNotificationsService.getUserNotificationsSettings(id, AuthUser.getCourseDistinctRoles(req.user)),
      this.userNotificationsService.getUserActiveConnections(id),
      this.userService.getUserByUserId(id),
    ]);

    return {
      notifications: notifications.map(notification => new NotificationUserSettingsDto(notification)),
      contacts: Object.fromEntries([
        ...connections.map(connection => [connection.channelId, connection.externalId]),
        ['email', profile.contactsEmail],
      ]),
    };
  }

  @Put('/')
  @ApiOperation({ operationId: 'updateUserNotifications' })
  @ApiOkResponse({ type: [UpdateNotificationUserSettingsDto] })
  @ApiBody({ type: [UpdateNotificationUserSettingsDto] })
  public async updateUserNotifications(@Req() req: CurrentRequest, @Body() dto: UpdateNotificationUserSettingsDto[]) {
    return await this.userNotificationsService.saveUserNotificationSettings(req.user.id, dto);
  }

  @Post('/connection/find')
  @UseGuards(RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOkResponse({ type: NotificationConnectionDto })
  @HttpCode(200)
  public async findConnection(
    @Body() dto: NotificationConnectionExistsDto,
    @Res() response: Response,
  ): Promise<NotificationConnectionDto> {
    const connection = await this.userNotificationsService.getUserConnection(dto);
    if (!connection) {
      response.status(404);
      return;
    }
    return new NotificationConnectionDto(connection);
  }

  @Post('/connection')
  @UseGuards(RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOkResponse({ type: NotificationConnectionDto })
  public async createUserConnection(@Body() dto: UpsertNotificationConnectionDto) {
    const connection = await this.userNotificationsService.saveUserConnection(dto);
    return new NotificationConnectionDto(connection);
  }

  @Delete('/connection/:channelId')
  @ApiOkResponse()
  public async deleteUserConnection(@Req() req: CurrentRequest, @Param('channelId') channelId: NotificationChannelId) {
    await this.userNotificationsService.deleteUserConnection({
      channelId,
      userId: req.user.id,
    });
  }
}
