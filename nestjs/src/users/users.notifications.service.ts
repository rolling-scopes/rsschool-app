import { Notification } from '@entities/notification';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateNotificationUserSettingsDto } from 'src/users/dto/update-notification-user-settings.dto';
import { In, Repository } from 'typeorm';
import { NotificationChannelSettings } from '@entities/notificationChannelSettings';
import { UsersService } from 'src/users/users.service';
import { Consent } from '@entities/consent';
import { User } from '@entities/user';
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
    @InjectRepository(Consent)
    private consentRepository: Repository<Consent>,
    @InjectRepository(NotificationUserConnection)
    private notificationUserConnectionRepository: Repository<NotificationUserConnection>,
    private usersService: UsersService,
  ) {}

  public getUserNotificationsSettings(userId: number, roles: string[]) {
    return this.notificationsRepository
      .createQueryBuilder('notification')
      .leftJoinAndMapMany(
        'notification.settings',
        NotificationUserSettings,
        'userSettings',
        'userSettings.notificationId = notification.id and userSettings.userId = :userId',
        { userId },
      )
      .where({ scope: In(roles), enabled: true })
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

  public saveUserConnection(connection: UpsertNotificationConnectionDto) {
    return this.notificationUserConnectionRepository.save(connection);
  }

  public deleteUserConnection(connection: { channelId: NotificationChannelId; userId: number }) {
    return this.notificationUserConnectionRepository.delete(connection);
  }

  public async getUserNotificationSettings(userId: number, notificationId: string) {
    const notificationChannels = (await this.userNotificationsRepository
      .createQueryBuilder('userNotifications')
      .where({
        notificationId,
        enabled: true,
        userId,
      })
      .innerJoinAndMapMany(
        'userNotifications.settings',
        NotificationChannelSettings,
        'channelSettings',
        'channelSettings.notificationId = userNotifications.notificationId and channelSettings.channelId = userNotifications.channelId',
      )
      .getMany()) as unknown as { id: string; settings: NotificationChannelSettings[] }[];

    return notificationChannels.flatMap(notification => notification.settings);
  }

  public async getUserContacts(userId: number) {
    const user = await this.usersService.getUserByUserId(userId);
    return {
      telegram: await this.getUserTelegramChatId(user),
      email: user.contactsEmail,
    };
  }

  public async getUserTelegramChatId(user: User) {
    if (!user.contactsTelegram) return;

    // temporary zone: for now we will get contacts from existing consent. TODO: remove consent model and create separate entity for storing just contact channels.
    const [tgConsent] = await this.consentRepository.find({
      where: {
        username: user.contactsTelegram,
        channelType: 'tg',
      },
    });

    return tgConsent?.channelValue;
  }
}
