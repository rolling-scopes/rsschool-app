import { NotificationChannelId } from '@entities/notificationChannel';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class NotificationConnectionExistsDto {
  @ApiProperty()
  @IsString()
  public channelId: NotificationChannelId;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public externalId?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  public userId?: number;
}
