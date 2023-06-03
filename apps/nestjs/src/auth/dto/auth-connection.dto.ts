import { NotificationChannelId } from '@entities/notificationChannel';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthConnectionDto {
  @IsNotEmpty()
  @ApiProperty()
  channelId: NotificationChannelId;

  @IsNotEmpty()
  @ApiProperty()
  externalId: string;
}
