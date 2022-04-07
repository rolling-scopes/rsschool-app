import { Notification, NotificationType } from '@entities/notification';
import { NotificationChannelId } from '@entities/notificationChannel';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class TelegramTemplate {
  @ApiProperty()
  body: string;
}

export class EmailTemplate {
  @ApiProperty()
  subject: string;
  @ApiProperty()
  body: string;
}

export class ChannelSettings {
  @ApiProperty()
  channelId: NotificationChannelId;
  @ApiProperty()
  template: EmailTemplate | TelegramTemplate;
}

export class NotificationDto {
  constructor(notification: Notification) {
    this.id = notification.id;
    this.name = notification.name;
    this.enabled = notification.enabled;
    this.type = notification.type;
    this.channels = notification.channels.map(settings => ({
      template: settings.template,
      channelId: settings.channelId,
    }));
  }

  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty({ enum: NotificationType, enumName: 'NotificationType' })
  @IsEnum(NotificationType)
  public type: NotificationType;

  @ApiProperty({ type: ChannelSettings, isArray: true })
  public channels: ChannelSettings[];
}
