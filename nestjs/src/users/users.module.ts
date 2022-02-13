import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { Notification } from '@entities/notification';
import { UsersNotificationsController } from './users.notifications.controller';
import { UserNotificationsService } from './users.notifications.service';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { Consent } from '@entities/consent';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notification, NotificationUserSettings, NotificationUserConnection, Consent]),
  ],
  controllers: [UsersNotificationsController],
  providers: [UsersService, UserNotificationsService],
  exports: [UsersService, UserNotificationsService],
})
export class UsersModule {}
