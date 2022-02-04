import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateNotificationUserSettingsDto {
  @ApiProperty()
  public notificationId: string;

  @ApiProperty()
  @IsBoolean()
  public enabled: boolean;

  @ApiProperty()
  public channelId: string;
}
