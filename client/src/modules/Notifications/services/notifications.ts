import axiosFactory from 'axios';
import { getServerAxiosProps } from 'utils/axios';

export class NotificationsService {
  constructor(private axios = axiosFactory.create(getServerAxiosProps())) {}

  getNotificationsSettings(): Promise<Notification[]> {
    return Promise.resolve([
      {
        id: 1,
        name: 'Cross-check mark',
        channels: {
          email: true,
          telegram: false,
        },
      },
    ]);
  }

  async saveNotificationSettings(notification: Notification[]) {
    await Promise.resolve(notification);
  }

  async saveUserNotifications(notification: Notification[]) {
    await Promise.resolve(notification);
  }

  getUserNotificationSettings() {
    return Promise.resolve([
      {
        id: 1,
        name: 'Cross-check mark',
        channels: {
          email: true,
          telegram: false,
        },
      },
    ]);
  }

  async sendMessage(channel: NotificationChannel, payload: NotificationPayload) {
    await this.axios.post('/api/notification/send', {
      payload,
      channel,
    });
  }
}

export type Notification = {
  id: number;
  name: string;
  channels: Partial<Record<NotificationChannel, boolean>>;
};

export enum NotificationChannel {
  email = 'email',
  telegram = 'telegram',
}

export type NotificationPayload = EmailPayload | TelegramPayload;

export type EmailPayload = {
  subject: string;
  body: string;
  userIds: number[];
};

export type TelegramPayload = {
  userIds: number[];
  body: string;
};
