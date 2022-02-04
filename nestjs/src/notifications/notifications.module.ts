import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { Notification } from '@entities/notification';
import { NotificationUserSettings } from '@entities/notificationUserSettings';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), TypeOrmModule.forFeature([NotificationUserSettings])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
