import { NotificationId } from '@entities/notification';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SendUserNotificationDto {
  @ApiProperty()
  @IsString()
  public notificationId: NotificationId;

  @ApiProperty()
  @IsNumber()
  public userId: number;

  @ApiProperty()
  @IsOptional()
  public data: object;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  // date in ms
  public expireDate?: number;
}
