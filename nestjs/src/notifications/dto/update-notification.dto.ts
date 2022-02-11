import { NotificationScope } from '@entities/notification';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ChannelSettings } from './notification.dto';

export class UpdateNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ enum: NotificationScope, enumName: 'NotificationScope' })
  @IsEnum(NotificationScope)
  public scope: NotificationScope;

  @ApiProperty({ type: ChannelSettings, isArray: true })
  @Type(() => ChannelSettings)
  @IsArray()
  public channels: ChannelSettings[];
}
