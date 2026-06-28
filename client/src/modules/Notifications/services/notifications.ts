import {
  NotificationDto,
  NotificationsApi,
  NotificationUserSettingsDto,
  UpdateNotificationDto,
  UpdateNotificationUserSettingsDto,
  UsersNotificationsApi,
} from '@client/api';

export class NotificationsService {
  constructor(
    private notificationsApi = new NotificationsApi(),
    private usersApi = new UsersNotificationsApi(),
  ) {}

  // System notifications settings
  async getNotifications(): Promise<NotificationDto[]> {
    const { data } = await this.notificationsApi.getNotifications();

    return data;
  }

  async saveNotification(notification: UpdateNotificationDto) {
    return this.notificationsApi.updateNotification(notification);
  }

  async createNotification(notification: UpdateNotificationDto) {
    return this.notificationsApi.createNotification(notification);
  }

  deleteNotification(id: string) {
    return this.notificationsApi.deleteNotification(id);
  }

  // user notification settings
  async saveUserNotifications(notifications: UpdateNotificationUserSettingsDto[]) {
    return this.usersApi.updateUserNotifications(notifications);
  }

  async getUserNotificationSettings() {
    const { data } = await this.usersApi.getUserNotifications();
    return data;
  }

  async getUserConnections() {
    const { data } = await this.usersApi.getUserNotificationConnections();
    return data.connections;
  }
}

export type UserNotificationSettings = NotificationUserSettingsDto;

export enum NotificationChannel {
  email = 'email',
  telegram = 'telegram',
  discord = 'discord',
}

export type MessagePayload = EmailPayload | TelegramPayload;

export type EmailPayload = {
  subject: string;
  body: string;
  userIds: number[];
};

export type TelegramPayload = {
  userIds: number[];
  body: string;
};

export type NotificationTemlate = TelegramTemplate | EmailTemplate | DiscordTemplate;

type TelegramTemplate = {
  body: string;
};

type EmailTemplate = {
  subject: string;
  body: string;
};

type DiscordTemplate = {
  body: string;
};
