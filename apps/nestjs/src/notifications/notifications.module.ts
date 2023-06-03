import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { Notification } from '@entities/notification';
import { ConfigModule } from 'src/config';
import { HttpModule } from '@nestjs/axios';
import { NotificationChannelSettings } from '@entities/notificationChannelSettings';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationChannelSettings]), ConfigModule, HttpModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
