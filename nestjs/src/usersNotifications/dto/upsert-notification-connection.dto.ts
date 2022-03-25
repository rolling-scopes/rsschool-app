import { NotificationChannelId } from '@entities/notificationChannel';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertNotificationConnectionDto {
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
