import { Notification } from '@entities/notification';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class NotificationUserSettingsDto {
  constructor(notification: Notification & { settings: NotificationUserSettings[] }) {
    this.id = notification.id;
    this.name = notification.name;
    this.enabled = notification.enabled;
    this.settings = {};
    notification.settings.forEach(setting => {
      this.settings[setting.channelId] = setting.enabled;
    });
  }

  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  @IsBoolean()
  public enabled: boolean;

  @ApiProperty({ type: Map })
  public settings: Record<string, boolean>;
}
