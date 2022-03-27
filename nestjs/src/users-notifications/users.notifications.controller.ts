import { Body, Controller, Get, HttpCode, NotFoundException, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard, AuthService } from 'src/auth';
import { UpdateNotificationUserSettingsDto } from './dto/update-notification-user-settings.dto';
import { NotificationUserSettingsDto, UserNotificationsDto } from './dto/notification-user-settings.dto';
import { NotificationConnectionExistsDto } from './dto/notification-connection-exists.dto';
import { UpsertNotificationConnectionDto } from './dto/upsert-notification-connection.dto';
import { NotificationConnectionDto } from './dto/notification-connection.dto';
import { UserNotificationsService } from './users.notifications.service';
import { SendUserNotificationDto } from './dto/send-user-notification.dto';
import { NotificationUserConnectionsDto } from './dto/notification-user-connections.dto';

@Controller('users/notifications')
@ApiTags('users notifications')
@UseGuards(DefaultGuard)
export class UsersNotificationsController {
  constructor(private userNotificationsService: UserNotificationsService, private authService: AuthService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getUserNotifications' })
  @ApiOkResponse({ type: UserNotificationsDto })
  public async getUserNotifications(@Req() req: CurrentRequest) {
    const {
      user: { id },
    } = req;
    const [notifications, connectionsResponse] = await Promise.all([
      this.userNotificationsService.getUserNotificationsSettings(id),
      this.getUserConnections(req),
    ]);

    return {
      notifications: notifications.map(notification => new NotificationUserSettingsDto(notification)),
      connections: connectionsResponse.connections,
    };
  }

  @Get('/connections')
  @ApiOperation({ operationId: 'getUserNotificationConnections' })
  @ApiOkResponse({ type: NotificationUserConnectionsDto })
  public async getUserConnections(@Req() req: CurrentRequest) {
    const {
      user: { id },
    } = req;
    const [connections, lastLink] = await Promise.all([
      this.userNotificationsService.getUserConnections(id),
      this.authService.getLoginStateByUserId(id),
    ]);

    return {
      connections: Object.fromEntries([
        ...connections.map(connection => [
          connection.channelId,
          {
            value: connection.externalId,
            enabled: connection.enabled,
            lastLinkSentAt: lastLink?.data.channelId === connection.channelId ? lastLink.createdDate : undefined,
          },
        ]),
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

  @Post('/confirmation/email')
  @ApiOperation({ operationId: 'sendEmailConfirmationLink' })
  public async sendEmailConfirmation(@Req() req: CurrentRequest) {
    const { id } = req.user;

    await this.userNotificationsService.sendEmailConfirmation(id);
  }

  @Post('/connection/find')
  @UseGuards(RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOkResponse({ type: NotificationConnectionDto })
  @HttpCode(200)
  public async findConnection(@Body() dto: NotificationConnectionExistsDto): Promise<NotificationConnectionDto> {
    const connection = await this.userNotificationsService.getUserConnection(dto);
    if (!connection) {
      throw new NotFoundException('no such connection');
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

  @Post('/send')
  @ApiOperation({ operationId: 'sendNotification' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async sendNotification(@Body() dto: SendUserNotificationDto) {
    await this.userNotificationsService.sendEventNotification(dto);
  }
}
