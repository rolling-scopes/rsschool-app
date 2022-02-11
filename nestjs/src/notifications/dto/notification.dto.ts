import { Notification, NotificationScope } from '@entities/notification';
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
  channelId: string;
  @ApiProperty()
  template: EmailTemplate | TelegramTemplate;
}

export class NotificationDto {
  constructor(notification: Notification) {
    this.id = notification.id;
    this.name = notification.name;
    this.scope = notification.scope;
    this.enabled = notification.enabled;
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

  @ApiProperty({ enum: NotificationScope, enumName: 'NotificationScope' })
  @IsEnum(NotificationScope)
  public scope: NotificationScope;

  @ApiProperty({ type: ChannelSettings, isArray: true })
  public channels: ChannelSettings[];
}
