import { NotificationChannelId } from '@entities/notificationChannel';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class NotificationConnectionDto {
  constructor(connection: NotificationUserConnection) {
    this.channelId = connection.channelId;
    this.enabled = connection.enabled;
    this.userId = connection.userId;
    this.externalId = connection.externalId;
  }

  @ApiProperty()
  @IsString()
  public channelId: NotificationChannelId;

  @ApiProperty()
  @IsString()
  public externalId: string;

  @ApiProperty()
  @IsNumber()
  public userId: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public enabled: boolean;
}
