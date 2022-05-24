import { Notification, NotificationType } from '@entities/notification';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateNotificationUserSettingsDto } from 'src/users-notifications/dto/update-notification-user-settings.dto';
import { Repository } from 'typeorm';
import { NotificationChannelSettings } from '@entities/notificationChannelSettings';
import { NotificationChannelId } from '@entities/notificationChannel';
import { NotificationConnectionExistsDto } from 'src/users-notifications/dto/notification-connection-exists.dto';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { UpsertNotificationConnectionDto } from 'src/users-notifications/dto/upsert-notification-connection.dto';
import { SendUserNotificationDto } from './dto/send-user-notification.dto';
import * as dayjs from 'dayjs';
import { NotificationData, NotificationsService } from '../notifications/notifications.service';
import { AuthService } from '../auth';
import { UsersService } from '../users/users.service';
import { GithubStrategy } from '../auth/strategies/github.strategy';

@Injectable()
export class UserNotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(NotificationUserSettings)
    private userNotificationsRepository: Repository<NotificationUserSettings>,
    @InjectRepository(NotificationUserConnection)
    private notificationUserConnectionRepository: Repository<NotificationUserConnection>,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private userService: UsersService,
    private githubService: GithubStrategy,
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
      .where({ enabled: true, type: NotificationType.event })
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
    const { channelId, externalId, userId } = info;
    if (!userId && !externalId) return;
    const config = externalId ? { externalId } : { userId };
    return this.notificationUserConnectionRepository.findOne({
      where: {
        channelId,
        ...config,
      },
    });
  }

  public getUserConnections(userId: number) {
    return this.notificationUserConnectionRepository.find({
      where: {
        userId,
      },
    });
  }

  public saveUserConnection(connection: UpsertNotificationConnectionDto) {
    return this.notificationUserConnectionRepository.save(connection);
  }

  public deleteUserConnection(connection: { channelId: NotificationChannelId; userId: number }) {
    return this.notificationUserConnectionRepository.delete(connection);
  }

  private async getUserNotificationSettings(userId: number, notificationId: string) {
    const notification = await (this.notificationsRepository
      .createQueryBuilder('notification')
      .leftJoinAndMapMany(
        'notification.userSettings',
        NotificationUserSettings,
        'userSettings',
        'userSettings.notificationId = notification.id and userSettings.userId = :userId',
        { userId },
      )
      .innerJoinAndMapMany(
        'notification.channels',
        NotificationChannelSettings,
        'channelSettings',
        'channelSettings.notificationId = :notificationId',
        { notificationId },
      )
      .innerJoinAndMapMany(
        'notification.connections',
        NotificationUserConnection,
        'connection',
        'connection.userId = :userId',
        { userId },
      )
      .where({ id: notificationId, enabled: true, type: NotificationType.event })
      .getOne() as Promise<
      Notification & {
        userSettings: NotificationUserSettings[];
        channels: NotificationChannelSettings[];
        connections: NotificationUserConnection[];
      }
    >);
    const connectionMap = new Map(notification?.connections.map(connection => [connection.channelId, connection]));
    const userSettings = new Map(notification?.userSettings.map(setting => [setting.channelId, setting.enabled]));

    return (
      notification?.channels
        .map(channel => {
          const { channelId } = channel;
          const externalId = connectionMap.get(channelId)?.externalId;

          const settingEnabled =
            channelId !== 'discord' ? userSettings.get(channelId) !== false : userSettings.get(channelId) === true;
          const enabled = connectionMap.get(channelId)?.enabled && settingEnabled;

          return {
            ...channel,
            enabled,
            externalId,
          };
        })
        .filter(channel => !!channel.externalId && channel.enabled) ?? []
    );
  }

  /**
   * Automatic user notification based on triggers. sent to subscribed channels based on subscription
   */
  public async sendEventNotification(notification: SendUserNotificationDto) {
    const { userId, data, notificationId, expireDate } = notification;
    const channels = await this.getUserNotificationSettings(userId, notificationId);

    const channelMap = new Map<NotificationChannelId, NotificationData>();
    channels.forEach(channel => {
      if (channel.channelId === 'discord') return;
      const message = this.notificationsService.buildChannelMessage(channel, data);
      if (message) {
        const { channelId, template, to } = message;
        channelMap.set(channelId, { template, to });
      }
    });

    if (channelMap.size === 0) return;

    await this.notificationsService.publishNotification({
      notificationId,
      channelId: Array.from(channelMap.keys()),
      userId,
      expireDate,
      data: Object.fromEntries(channelMap) as Record<NotificationChannelId, NotificationData>,
    });
  }

  public async sendEmailConfirmation(userId: number, checkTimeLimit = true) {
    const [user, lastLink, connections] = await Promise.all([
      this.userService.getUserByUserId(userId),
      checkTimeLimit ? this.authService.getLoginStateByUserId(userId) : Promise.resolve(),
      this.getUserConnections(userId),
    ]);
    const email = user.contactsEmail;
    if (!email) return;

    if (connections.find(connection => connection.channelId === 'email' && connection.enabled)) return;

    if (checkTimeLimit && lastLink && dayjs().diff(lastLink.createdDate) < 1000 * 60) {
      throw new BadRequestException('Link was just sent. Please try later');
    }

    const link = await this.githubService.getAuthorizeUrl({
      data: {
        channelId: 'email',
        externalId: email,
      },
      userId,
      expires: dayjs().add(24, 'hours').toISOString(),
    });

    await this.notificationsService.sendMessage({
      notificationId: 'emailConfirmation',
      userId,
      data: {
        confirmationLink: link,
      },
      channelId: 'email',
      channelValue: email,
    });
  }
}
