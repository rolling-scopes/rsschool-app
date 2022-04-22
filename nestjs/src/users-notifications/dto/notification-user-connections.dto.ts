import { NotificationChannelId } from '@entities/notificationChannel';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ConnectionDetails {
  @ApiProperty()
  value: string;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ required: false })
  lastLinkSentAt?: string;
}

export class NotificationUserConnectionsDto {
  @ApiProperty({ type: Map })
  public connections: Record<NotificationChannelId, ConnectionDetails>;
}
