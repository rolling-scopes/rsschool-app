import { Notification, NotificationId } from '@entities/notification';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config';
import { Repository } from 'typeorm';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { HttpService } from '@nestjs/axios';
import { EmailTemplate, NotificationChannelSettings, TelegramTemplate } from '@entities/notificationChannelSettings';
import { compile } from 'handlebars';
import { NotificationChannelId } from '@entities/notificationChannel';
import { emailTemplate } from './email-template';
import { lastValueFrom } from 'rxjs';

const compiledEmailTemplate = compile(emailTemplate, { noEscape: true });
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('notifications');

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(NotificationChannelSettings)
    private channelSettingsRepository: Repository<NotificationChannelSettings>,
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

  public deleteNotification(id: NotificationId) {
    return this.notificationsRepository.delete({ id });
  }

  /**
   * Messages to users regarless on user subscription status to specific channel
   */
  public async sendMessage(notification: {
    notificationId: NotificationId;
    userId: number;
    data: object;
    channelId: NotificationChannelId;
    channelValue: string;
  }) {
    const { userId, data, notificationId, channelId, channelValue } = notification;
    const channelSettings = await this.getChannelSettings(channelId, notificationId);

    const message = this.buildChannelMessage({ ...channelSettings, externalId: channelValue }, data);

    if (!message) {
      this.logger.error({
        message: `failed to build message fo notification ${notification.notificationId} and user ${notification.userId}`,
      });
      return;
    }

    await this.publishNotification({
      notificationId,
      channelId: [channelId],
      userId,
      data: {
        [channelId]: {
          template: message.template,
          to: message.to,
        },
      },
    });
  }

  private getChannelSettings(channelId: NotificationChannelId, notificationId: NotificationId) {
    return this.channelSettingsRepository.findOne({
      where: {
        notificationId,
        channelId,
      },
    });
  }

  public buildChannelMessage(channel: NotificationChannelSettings & { externalId: string }, data: object) {
    const { channelId, externalId, template } = channel;
    if (!externalId || !template) return;

    const body = compile(channel.template.body)(data);
    const channelMessage = {
      channelId,
      to: externalId,
      template: {
        body: channel.channelId === 'email' ? compiledEmailTemplate({ emailBody: body }) : body,
      },
    };
    if (channel.channelId === 'email') {
      (channelMessage.template as EmailTemplate).subject = (channel.template as EmailTemplate).subject;
    }

    return channelMessage;
  }

  public async publishNotification(notification: NotificationPayload) {
    if (this.configService.isDev) return;

    const { restApiKey, restApiUrl } = this.configService.awsServices;
    await lastValueFrom(
      this.httpService.post(`${restApiUrl}/v2/notification`, notification, {
        headers: { 'x-api-key': restApiKey },
      }),
    );

    this.logger.log({ message: `notification ${notification.notificationId} sent to ${notification.userId}` });
  }
}

type NotificationPayload = {
  notificationId: NotificationId;
  channelId: NotificationChannelId[];
  userId: number;
  expireDate?: number;
  data: Partial<Record<NotificationChannelId, NotificationData>>;
};

export type NotificationData = {
  to: string;
  template: EmailTemplate | TelegramTemplate;
};
