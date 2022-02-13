import { Notification } from '@entities/notification';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config';
import { Repository } from 'typeorm';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { HttpService } from '@nestjs/axios';
import { SendNotificationDto } from './dto/send-notification.dto';
import { EmailTemplate, NotificationChannelSettings, TelegramTemplate } from '@entities/NotificationChannelSettings';
import { compile } from 'handlebars';
import { NotificationChannelId } from '@entities/notificationChannel';
import { UserNotificationsService } from 'src/users/users.notifications.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private userNotificationsService: UserNotificationsService,
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

  public async sendNotification(notification: SendNotificationDto) {
    const { userId, data, notificationId, expireDate } = notification;
    const [channels, contacts] = await Promise.all([
      this.userNotificationsService.getUserNotificationSettings(userId, notificationId),
      this.userNotificationsService.getUserContacts(userId),
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
