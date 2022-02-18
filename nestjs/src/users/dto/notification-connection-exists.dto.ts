import { NotificationChannelId } from '@entities/notificationChannel';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class NotificationConnectionExistsDto {
  @ApiProperty()
  @IsString()
  public channelId: NotificationChannelId;

  @ApiProperty()
  @IsString()
  public externalId: string;
}
