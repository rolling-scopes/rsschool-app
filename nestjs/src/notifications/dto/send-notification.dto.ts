import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { NotificationId } from '../notificationIds';

export class SendNotificationDto {
  @ApiProperty()
  @IsString()
  public notificationId: NotificationId;

  @ApiProperty()
  @IsNumber()
  public userId: number;

  @ApiProperty()
  @IsNotEmpty()
  public data: object;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  // date in ms
  public expireDate?: number;
}
