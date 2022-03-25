import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { Notification } from '@entities/notification';
import { UsersNotificationsController } from './users.notifications.controller';
import { UserNotificationsService } from './users.notifications.service';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notification, NotificationUserSettings, NotificationUserConnection]),
    NotificationsModule,
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersNotificationsController],
  providers: [UserNotificationsService],
  exports: [UserNotificationsService],
})
export class UsersNotificationsModule {}
