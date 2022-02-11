import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { Notification } from '@entities/notification';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { ConfigModule } from 'src/config';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users';
import { Consent } from '@entities/consent';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    TypeOrmModule.forFeature([NotificationUserSettings]),
    TypeOrmModule.forFeature([Consent]),
    ConfigModule,
    HttpModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
