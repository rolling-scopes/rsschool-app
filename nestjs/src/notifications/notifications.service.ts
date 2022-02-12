import { Notification } from '@entities/notification';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config';
import { UpdateNotificationUserSettingsDto } from 'src/users/dto/update-notification-user-settings.dto';
import { In, Repository } from 'typeorm';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { HttpService } from '@nestjs/axios';
import { SendNotificationDto } from './dto/send-notification.dto';
import { EmailTemplate, NotificationChannelSettings, TelegramTemplate } from '@entities/NotificationChannelSettings';
import { compile } from 'handlebars';
import { UsersService } from 'src/users/users.service';
import { Consent } from '@entities/consent';
import { User } from '@entities/user';
import { NotificationChannelId } from '@entities/notificationChannel';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(NotificationUserSettings)
    private userNotificationsRepository: Repository<NotificationUserSettings>,
    @InjectRepository(Consent)
    private consentRepository: Repository<Consent>,
    private usersService: UsersService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  public getNotifications() {
    return this.notificationsRepository.find({ relations: ['channels'], order: { name: 'ASC' } });
  }

  public saveNotification(notification: UpdateNotificationDto) {
    return this.notificationsRepository.save(notification);
  }

  public async createNotification(notification: UpdateNotificationDto) {
    const existing = await this.notificationsRepository.findOne({ where: { id: notification.id } });

    if (existing) {
      throw new BadRequestException(`notification with id ${notification.id} already exists`);
    }

    return this.notificationsRepository.save(notification);
  }

  public deleteNotification(id: string) {
    return this.notificationsRepository.delete({ id });
  }

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
  public async sendNotification(notification: SendNotificationDto) {
    const { userId, notificationId, data, expireDate } = notification;
    const [channels, contacts] = await Promise.all([
      this.getUserNotificationSettings(userId, notificationId),
      this.getUserContacts(userId),
    ]);

    const channelMap = new Map<NotificationChannelId, NotificationData>();
    channels.forEach(channel => {
      const message = this.buildChannelMessage(channel, data, contacts);
      if (message) {
        const { channelId, template, to } = message;
        channelMap.set(channelId, { template, to });
      }
    });

    await this.publishNotification({
      channelId: Array.from(channelMap.keys()),
      userId,
      expireDate,
      data: Object.fromEntries(channelMap) as Record<NotificationChannelId, NotificationData>,
    });
  }

  private async getUserNotificationSettings(userId: number, notificationId: string) {
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

  private buildChannelMessage(
    channel: NotificationChannelSettings,
    data: object,
    contacts: Record<NotificationChannelId, string>,
  ) {
    const channelId = channel.channelId as NotificationChannelId;
    const to = contacts[channelId];
    if (!to || !channel.template) return;

    const channelMessage = {
      channelId,
      to,
      template: {
        body: compile(channel.template.body)(data),
      },
    };
    if (channel.channelId === 'email') {
      (channelMessage.template as EmailTemplate).subject = (channel.template as EmailTemplate).subject;
    }

    return channelMessage;
  }

  private async getUserContacts(userId: number) {
    const user = await this.usersService.getUserByUserId(userId);

    return {
      telegram: await this.getUserTelegramChatId(user),
      email: user.primaryEmail,
    };
  }

  private async getUserTelegramChatId(user: User) {
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

  private async publishNotification(notification: NotificationPayload) {
    if (this.configService.isDev) return;

    const { restApiKey, restApiUrl } = this.configService.awsServices;

    await this.httpService.post(`${restApiUrl}/v2/notification`, notification, {
      headers: { 'x-api-key': restApiKey },
    });
  }
}

type NotificationPayload = {
  channelId: NotificationChannelId[];
  userId: number;
  expireDate?: number;
  data: Record<NotificationChannelId, NotificationData>;
};

type NotificationData = {
  to: string;
  template: EmailTemplate | TelegramTemplate;
};
