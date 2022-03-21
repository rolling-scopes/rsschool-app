import { NotificationId, NotificationType } from '@entities/notification';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ChannelSettings } from './notification.dto';

export class UpdateNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public id: NotificationId;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ type: ChannelSettings, isArray: true })
  @Type(() => ChannelSettings)
  @IsArray()
  public channels: ChannelSettings[];

  @ApiProperty({ enum: NotificationType, enumName: 'NotificationType' })
  @IsEnum(NotificationType)
  public type: NotificationType;
}
