import { Notification } from '@entities/notification';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateNotificationUserSettingsDto } from 'src/users/dto/update-notification-user-settings.dto';
import { Repository } from 'typeorm';
import { NotificationChannelSettings } from '@entities/notificationChannelSettings';
import { UsersService } from './users.service';
import { NotificationChannelId } from '@entities/notificationChannel';
import { NotificationConnectionExistsDto } from 'src/users/dto/notification-connection-exists.dto';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { UpsertNotificationConnectionDto } from 'src/users/dto/upsert-notification-connection.dto';

@Injectable()
export class UserNotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(NotificationUserSettings)
    private userNotificationsRepository: Repository<NotificationUserSettings>,
    @InjectRepository(NotificationUserConnection)
    private notificationUserConnectionRepository: Repository<NotificationUserConnection>,
    private usersService: UsersService,
  ) {}

  public getUserNotificationsSettings(userId: number) {
    return this.notificationsRepository
      .createQueryBuilder('notification')
      .leftJoinAndMapMany(
        'notification.settings',
        NotificationUserSettings,
        'userSettings',
        'userSettings.notificationId = notification.id and userSettings.userId = :userId',
        { userId },
      )
      .where({ enabled: true })
      .orderBy('name')
      .getMany() as Promise<(Notification & { settings: NotificationUserSettings[] })[]>;
  }

  public async saveUserNotificationSettings(userId: number, notifications: UpdateNotificationUserSettingsDto[]) {
    await this.userNotificationsRepository
      .createQueryBuilder()
      .insert()
      .into(NotificationUserSettings)
      .values(
        notifications.map(notification => ({
          notificationId: notification.notificationId,
          channelId: notification.channelId,
          enabled: notification.enabled,
          userId: userId,
        })),
      )
      .orUpdate(['enabled'], ['channelId', 'userId', 'notificationId'])
      .execute();
  }

  public getUserConnection(info: NotificationConnectionExistsDto) {
    const { channelId, externalId } = info;
    return this.notificationUserConnectionRepository.findOne({
      where: {
        channelId,
        externalId,
      },
    });
  }

  public getUserActiveConnections(userId: number) {
    return this.notificationUserConnectionRepository.find({
      where: {
        userId,
        enabled: true,
      },
    });
  }

  public saveUserConnection(connection: UpsertNotificationConnectionDto) {
    return this.notificationUserConnectionRepository.save(connection);
  }

  public deleteUserConnection(connection: { channelId: NotificationChannelId; userId: number }) {
    return this.notificationUserConnectionRepository.delete(connection);
  }

  public async getUserNotificationSettings(userId: number, notificationId: string) {
    const [notificationChannels, user] = await Promise.all([
      this.userNotificationsRepository
        .createQueryBuilder('userNotifications')
        .where({
          notificationId,
          enabled: true,
          userId,
        })
        .leftJoinAndMapOne(
          'userNotifications.connection',
          NotificationUserConnection,
          'connection',
          `userNotifications.userId = connection.userId and
           userNotifications.channelId = connection.channelId and
           connection.enabled = true
        `,
        )
        .innerJoinAndMapOne(
          'userNotifications.settings',
          NotificationChannelSettings,
          'channelSettings',
          'channelSettings.notificationId = userNotifications.notificationId and channelSettings.channelId = userNotifications.channelId',
        )
        .getMany() as unknown as {
        id: string;
        channelId: NotificationChannelId;
        settings: NotificationChannelSettings;
        connection: NotificationUserConnection;
      }[],
      this.usersService.getUserByUserId(userId),
    ]);
    return notificationChannels
      .flatMap(notification => {
        const { connection, settings } = notification;
        return {
          ...settings,
          externalId: notification.channelId === 'email' ? user.contactsEmail : connection?.externalId,
        };
      })
      .filter(notification => !!notification.externalId);
  }
}
