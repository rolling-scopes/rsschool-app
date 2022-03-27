import { NotificationId } from '@entities/notification';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { NotificationDto } from './dto/notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
@ApiTags('notifications')
@UseGuards(DefaultGuard, RoleGuard)
@RequiredRoles([Role.Admin])
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getNotifications' })
  @ApiForbiddenResponse()
  @ApiOkResponse({ type: [NotificationDto] })
  public async getNotifications() {
    const notifications = await this.notificationsService.getNotifications();
    return notifications.map(notification => new NotificationDto(notification));
  }

  @Put('/')
  @ApiOperation({ operationId: 'updateNotification' })
  @ApiOkResponse({ type: NotificationDto })
  @ApiForbiddenResponse()
  public async updateNotification(@Body() dto: UpdateNotificationDto) {
    const notification = await this.notificationsService.saveNotification(dto);
    return new NotificationDto(notification);
  }

  @Post('/')
  @ApiOperation({ operationId: 'createNotification' })
  @ApiOkResponse({ type: NotificationDto })
  @ApiForbiddenResponse()
  public async createNotification(@Body() dto: UpdateNotificationDto) {
    const notification = await this.notificationsService.createNotification(dto);
    return new NotificationDto(notification);
  }

  @Delete('/:id')
  @ApiOperation({ operationId: 'deleteNotification' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async deleteNotification(@Param('id') id: NotificationId) {
    await this.notificationsService.deleteNotification(id);
  }
}
