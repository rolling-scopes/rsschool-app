import type { Mocked } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Notification } from '@entities/notification';
import { NotificationChannelSettings } from '@entities/notificationChannelSettings';
import { ConfigService } from '../config';
import { NotificationsService } from './notifications.service';

const mockNotification = {
  id: 'taskGrade',
  name: 'Task grade',
  enabled: true,
} as Partial<Notification> as Notification;

const emailChannelSettings = {
  channelId: 'email',
  notificationId: 'taskGrade',
  template: { subject: 'Subject {{name}}', body: 'Hello {{name}}' },
} as Partial<NotificationChannelSettings> as NotificationChannelSettings;

const telegramChannelSettings = {
  channelId: 'telegram',
  notificationId: 'taskGrade',
  template: { body: 'Hello {{name}}' },
} as Partial<NotificationChannelSettings> as NotificationChannelSettings;

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsRepository: Mocked<{
    findOneBy: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  }>;
  let channelSettingsRepository: Mocked<{ findOne: ReturnType<typeof vi.fn> }>;
  let httpService: Mocked<{ post: ReturnType<typeof vi.fn> }>;
  let configService: { isDev: boolean; awsServices: { restApiUrl: string; restApiKey: string } };

  beforeEach(async () => {
    const notificationsRepoValue = {
      findOneBy: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const channelSettingsRepoValue = { findOne: vi.fn() };
    const httpServiceValue = { post: vi.fn() };
    configService = {
      isDev: false,
      awsServices: { restApiUrl: 'https://api.example.com', restApiKey: 'secret-key' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notificationsRepoValue },
        { provide: getRepositoryToken(NotificationChannelSettings), useValue: channelSettingsRepoValue },
        { provide: ConfigService, useValue: configService },
        { provide: HttpService, useValue: httpServiceValue },
      ],
    }).compile();

    service = module.get(NotificationsService);
    notificationsRepository = module.get(getRepositoryToken(Notification));
    channelSettingsRepository = module.get(getRepositoryToken(NotificationChannelSettings));
    httpService = module.get(HttpService);
  });

  describe('getNotification', () => {
    it('finds a notification by id', async () => {
      notificationsRepository.findOneBy.mockResolvedValue(mockNotification);

      const result = await service.getNotification('taskGrade');

      expect(notificationsRepository.findOneBy).toHaveBeenCalledWith({ id: 'taskGrade' });
      expect(result).toBe(mockNotification);
    });
  });

  describe('getNotifications', () => {
    it('lists notifications with relations ordered by name', async () => {
      notificationsRepository.find.mockResolvedValue([mockNotification]);

      const result = await service.getNotifications();

      expect(notificationsRepository.find).toHaveBeenCalledWith({
        relations: ['channels', 'parent'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('saveNotification', () => {
    it('maps a parentId to a parent relation object', async () => {
      notificationsRepository.save.mockResolvedValue(mockNotification);

      await service.saveNotification({
        id: 'taskGrade',
        name: 'Task grade',
        enabled: true,
        channels: [],
        type: 'event' as never,
        parentId: 'messages' as never,
      });

      expect(notificationsRepository.save).toHaveBeenCalledWith({
        id: 'taskGrade',
        name: 'Task grade',
        enabled: true,
        channels: [],
        type: 'event',
        parent: { id: 'messages' },
      });
    });

    it('sets parent to null when there is no parentId', async () => {
      notificationsRepository.save.mockResolvedValue(mockNotification);

      await service.saveNotification({
        id: 'taskGrade',
        name: 'Task grade',
        enabled: true,
        channels: [],
        type: 'event' as never,
      });

      expect(notificationsRepository.save).toHaveBeenCalledWith({
        id: 'taskGrade',
        name: 'Task grade',
        enabled: true,
        channels: [],
        type: 'event',
        parent: null,
      });
    });
  });

  describe('createNotification', () => {
    it('saves the notification when it does not already exist', async () => {
      notificationsRepository.findOne.mockResolvedValue(null);
      notificationsRepository.save.mockResolvedValue(mockNotification);

      const dto = {
        id: 'taskGrade',
        name: 'Task grade',
        enabled: true,
        channels: [],
        type: 'event' as never,
      };
      const result = await service.createNotification(dto);

      expect(notificationsRepository.findOne).toHaveBeenCalledWith({ where: { id: 'taskGrade' } });
      expect(notificationsRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockNotification);
    });

    it('throws a BadRequestException when the notification already exists', async () => {
      notificationsRepository.findOne.mockResolvedValue(mockNotification);

      await expect(
        service.createNotification({
          id: 'taskGrade',
          name: 'Task grade',
          enabled: true,
          channels: [],
          type: 'event' as never,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(notificationsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteNotification', () => {
    it('deletes by id', async () => {
      notificationsRepository.delete.mockResolvedValue({} as never);

      await service.deleteNotification('taskGrade');

      expect(notificationsRepository.delete).toHaveBeenCalledWith({ id: 'taskGrade' });
    });
  });

  describe('buildChannelMessage', () => {
    it('returns undefined when externalId is missing', () => {
      const result = service.buildChannelMessage({ ...emailChannelSettings, externalId: undefined }, { name: 'John' });
      expect(result).toBeUndefined();
    });

    it('returns undefined when the template is missing', () => {
      const result = service.buildChannelMessage(
        { ...emailChannelSettings, template: undefined as never, externalId: 'john@x.com' },
        { name: 'John' },
      );
      expect(result).toBeUndefined();
    });

    it('compiles a non-email channel body via Handlebars without wrapping in the email template', () => {
      const result = service.buildChannelMessage({ ...telegramChannelSettings, externalId: '12345' }, { name: 'John' });

      expect(result).toEqual({
        channelId: 'telegram',
        to: '12345',
        template: { body: 'Hello John' },
      });
    });

    it('wraps email bodies in the email template and copies the subject', () => {
      const result = service.buildChannelMessage(
        { ...emailChannelSettings, externalId: 'john@x.com' },
        { name: 'John' },
      );

      expect(result?.channelId).toBe('email');
      expect(result?.to).toBe('john@x.com');
      // The compiled email body is wrapped in the HTML email template
      expect(result?.template.body).toContain('Hello John');
      expect(result?.template.body).toContain('<!DOCTYPE html>');
      // Subject is copied verbatim from the EmailTemplate and is NOT run through Handlebars
      expect((result?.template as { subject: string }).subject).toBe('Subject {{name}}');
    });

    it('escapes HTML by default and preserves it when noEscape is set', () => {
      const escaped = service.buildChannelMessage(
        { ...telegramChannelSettings, externalId: '1', noEscape: false },
        { name: '<b>' },
      );
      const raw = service.buildChannelMessage(
        { ...telegramChannelSettings, externalId: '1', noEscape: true },
        { name: '<b>' },
      );

      expect(escaped?.template.body).toBe('Hello &lt;b&gt;');
      expect(raw?.template.body).toBe('Hello <b>');
    });
  });

  describe('publishNotification', () => {
    const payload = {
      notificationId: 'taskGrade' as const,
      channelId: ['email' as const],
      userId: 1,
      data: {},
    };

    it('is a no-op in dev mode', async () => {
      configService.isDev = true;

      await service.publishNotification(payload);

      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('posts to the AWS notification endpoint with the api key header', async () => {
      configService.isDev = false;
      httpService.post.mockReturnValue(of({ data: {} }));

      await service.publishNotification(payload);

      expect(httpService.post).toHaveBeenCalledWith('https://api.example.com/v2/notification', payload, {
        headers: { 'x-api-key': 'secret-key' },
      });
    });
  });

  describe('sendMessage', () => {
    const baseMessage = {
      notificationId: 'taskGrade' as const,
      userId: 1,
      data: { name: 'John' },
      channelId: 'email' as const,
      channelValue: 'john@x.com',
    };

    it('builds and publishes a message when channel settings exist', async () => {
      channelSettingsRepository.findOne.mockResolvedValue(emailChannelSettings);
      const publishSpy = vi.spyOn(service, 'publishNotification').mockResolvedValue(undefined);

      await service.sendMessage(baseMessage);

      expect(channelSettingsRepository.findOne).toHaveBeenCalledWith({
        where: { notificationId: 'taskGrade', channelId: 'email' },
      });
      expect(publishSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationId: 'taskGrade',
          channelId: ['email'],
          userId: 1,
          data: expect.objectContaining({
            email: expect.objectContaining({ to: 'john@x.com' }),
          }),
        }),
      );
    });

    it('logs an error and does not publish when there are no channel settings', async () => {
      channelSettingsRepository.findOne.mockResolvedValue(null);
      const publishSpy = vi.spyOn(service, 'publishNotification');

      await service.sendMessage(baseMessage);

      expect(publishSpy).not.toHaveBeenCalled();
    });

    it('does not publish when the message cannot be built (no channelValue)', async () => {
      channelSettingsRepository.findOne.mockResolvedValue(emailChannelSettings);
      const publishSpy = vi.spyOn(service, 'publishNotification');

      await service.sendMessage({ ...baseMessage, channelValue: '' });

      expect(publishSpy).not.toHaveBeenCalled();
    });
  });
});
