import type { Mocked } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from '@entities/notification';
import { NotificationUserSettings } from '@entities/notificationUserSettings';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { NotificationChannelSettings } from '@entities/notificationChannelSettings';
import { User } from '@entities/user';
import { IsNull } from 'typeorm';
import { UserNotificationsService } from './users.notifications.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from '../auth';
import { UsersService } from '../users/users.service';
import { GithubStrategy } from '../auth/strategies/github.strategy';

type QueryBuilderMock = {
  leftJoinAndMapMany: ReturnType<typeof vi.fn>;
  innerJoinAndMapMany: ReturnType<typeof vi.fn>;
  innerJoinAndMapOne: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
  getMany: ReturnType<typeof vi.fn>;
  getOne: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  into: ReturnType<typeof vi.fn>;
  values: ReturnType<typeof vi.fn>;
  orUpdate: ReturnType<typeof vi.fn>;
  execute: ReturnType<typeof vi.fn>;
};

const createQueryBuilderMock = (): QueryBuilderMock => {
  const qb: Partial<QueryBuilderMock> = {
    leftJoinAndMapMany: vi.fn(),
    innerJoinAndMapMany: vi.fn(),
    innerJoinAndMapOne: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    getMany: vi.fn(),
    getOne: vi.fn(),
    insert: vi.fn(),
    into: vi.fn(),
    values: vi.fn(),
    orUpdate: vi.fn(),
    execute: vi.fn(),
  };
  qb.leftJoinAndMapMany!.mockReturnValue(qb);
  qb.innerJoinAndMapMany!.mockReturnValue(qb);
  qb.innerJoinAndMapOne!.mockReturnValue(qb);
  qb.where!.mockReturnValue(qb);
  qb.orderBy!.mockReturnValue(qb);
  qb.insert!.mockReturnValue(qb);
  qb.into!.mockReturnValue(qb);
  qb.values!.mockReturnValue(qb);
  qb.orUpdate!.mockReturnValue(qb);
  return qb as QueryBuilderMock;
};

describe('UserNotificationsService', () => {
  let service: UserNotificationsService;
  let notificationsRepository: Mocked<{ createQueryBuilder: ReturnType<typeof vi.fn> }>;
  let userNotificationsRepository: Mocked<{ createQueryBuilder: ReturnType<typeof vi.fn> }>;
  let connectionRepository: Mocked<{
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  }>;
  let channelsSettingsRepository: Mocked<{ createQueryBuilder: ReturnType<typeof vi.fn> }>;
  let notificationsService: Mocked<{
    getNotification: ReturnType<typeof vi.fn>;
    buildChannelMessage: ReturnType<typeof vi.fn>;
    publishNotification: ReturnType<typeof vi.fn>;
    sendMessage: ReturnType<typeof vi.fn>;
  }>;
  let authService: Mocked<{ getLoginStateByUserId: ReturnType<typeof vi.fn> }>;
  let usersService: Mocked<{ getUserByUserId: ReturnType<typeof vi.fn> }>;
  let githubService: Mocked<{ getAuthorizeUrl: ReturnType<typeof vi.fn> }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserNotificationsService,
        { provide: getRepositoryToken(Notification), useValue: { createQueryBuilder: vi.fn() } },
        { provide: getRepositoryToken(NotificationUserSettings), useValue: { createQueryBuilder: vi.fn() } },
        {
          provide: getRepositoryToken(NotificationUserConnection),
          useValue: { findOne: vi.fn(), find: vi.fn(), save: vi.fn(), delete: vi.fn() },
        },
        { provide: getRepositoryToken(NotificationChannelSettings), useValue: { createQueryBuilder: vi.fn() } },
        {
          provide: NotificationsService,
          useValue: {
            getNotification: vi.fn(),
            buildChannelMessage: vi.fn(),
            publishNotification: vi.fn(),
            sendMessage: vi.fn(),
          },
        },
        { provide: AuthService, useValue: { getLoginStateByUserId: vi.fn() } },
        { provide: UsersService, useValue: { getUserByUserId: vi.fn() } },
        { provide: GithubStrategy, useValue: { getAuthorizeUrl: vi.fn() } },
      ],
    }).compile();

    service = module.get(UserNotificationsService);
    notificationsRepository = module.get(getRepositoryToken(Notification));
    userNotificationsRepository = module.get(getRepositoryToken(NotificationUserSettings));
    connectionRepository = module.get(getRepositoryToken(NotificationUserConnection));
    channelsSettingsRepository = module.get(getRepositoryToken(NotificationChannelSettings));
    notificationsService = module.get(NotificationsService);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    githubService = module.get(GithubStrategy);
  });

  describe('getUserNotificationsSettings', () => {
    it('builds an enabled event-notification query with mapped user settings', async () => {
      const qb = createQueryBuilderMock();
      qb.getMany.mockResolvedValue([{ id: 'taskGrade', settings: [] }]);
      notificationsRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getUserNotificationsSettings(7);

      expect(notificationsRepository.createQueryBuilder).toHaveBeenCalledWith('notification');
      expect(qb.leftJoinAndMapMany).toHaveBeenCalledWith(
        'notification.settings',
        NotificationUserSettings,
        'userSettings',
        'userSettings.notificationId = notification.id and userSettings.userId = :userId',
        { userId: 7 },
      );
      expect(qb.where).toHaveBeenCalledWith({ enabled: true, type: 'event', parent: IsNull() });
      expect(qb.orderBy).toHaveBeenCalledWith('name');
      expect(result).toEqual([{ id: 'taskGrade', settings: [] }]);
    });
  });

  describe('saveUserNotificationSettings', () => {
    it('upserts settings rows, mapping each notification to the user id', async () => {
      const qb = createQueryBuilderMock();
      qb.execute.mockResolvedValue({});
      userNotificationsRepository.createQueryBuilder.mockReturnValue(qb);

      await service.saveUserNotificationSettings(7, [
        { notificationId: 'taskGrade', channelId: 'email', enabled: true },
      ]);

      expect(qb.into).toHaveBeenCalledWith(NotificationUserSettings);
      expect(qb.values).toHaveBeenCalledWith([
        { notificationId: 'taskGrade', channelId: 'email', enabled: true, userId: 7 },
      ]);
      expect(qb.orUpdate).toHaveBeenCalledWith(['enabled'], ['channelId', 'userId', 'notificationId']);
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('getUserConnection', () => {
    it('returns undefined when neither userId nor externalId is provided', () => {
      const result = service.getUserConnection({ channelId: 'email' });
      expect(result).toBeUndefined();
      expect(connectionRepository.findOne).not.toHaveBeenCalled();
    });

    it('queries by externalId when provided (preferred over userId)', () => {
      connectionRepository.findOne.mockReturnValue('found' as never);

      const result = service.getUserConnection({ channelId: 'email', externalId: 'a@b.com', userId: 5 });

      expect(connectionRepository.findOne).toHaveBeenCalledWith({
        where: { channelId: 'email', externalId: 'a@b.com' },
      });
      expect(result).toBe('found');
    });

    it('queries by userId when externalId is absent', () => {
      connectionRepository.findOne.mockReturnValue('found' as never);

      service.getUserConnection({ channelId: 'telegram', userId: 5 });

      expect(connectionRepository.findOne).toHaveBeenCalledWith({
        where: { channelId: 'telegram', userId: 5 },
      });
    });
  });

  describe('getUserConnections', () => {
    it('finds all connections for a user', () => {
      connectionRepository.find.mockReturnValue('list' as never);

      const result = service.getUserConnections(7);

      expect(connectionRepository.find).toHaveBeenCalledWith({ where: { userId: 7 } });
      expect(result).toBe('list');
    });
  });

  describe('saveUserConnection', () => {
    it('delegates to repository save', () => {
      connectionRepository.save.mockReturnValue('saved' as never);
      const dto = { channelId: 'email' as const, externalId: 'a@b.com', userId: 7, enabled: true };

      const result = service.saveUserConnection(dto);

      expect(connectionRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toBe('saved');
    });
  });

  describe('deleteUserConnection', () => {
    it('delegates to repository delete', () => {
      connectionRepository.delete.mockReturnValue('deleted' as never);

      const result = service.deleteUserConnection({ channelId: 'email', userId: 7 });

      expect(connectionRepository.delete).toHaveBeenCalledWith({ channelId: 'email', userId: 7 });
      expect(result).toBe('deleted');
    });
  });

  describe('sendEventNotification', () => {
    const dto = { notificationId: 'taskGrade' as const, userId: 7, data: { name: 'John' } };

    it('returns early when the notification is missing', async () => {
      notificationsService.getNotification.mockResolvedValue(null);

      await service.sendEventNotification(dto);

      expect(notificationsService.publishNotification).not.toHaveBeenCalled();
    });

    it('returns early when the notification is disabled', async () => {
      notificationsService.getNotification.mockResolvedValue({ enabled: false, type: 'event' });

      await service.sendEventNotification(dto);

      expect(notificationsService.publishNotification).not.toHaveBeenCalled();
    });

    it('publishes built messages for event-type notifications, skipping discord channels', async () => {
      notificationsService.getNotification.mockResolvedValue({ enabled: true, type: 'event' });

      // getUserNotificationSettings (event path) uses the notifications query builder
      const qb = createQueryBuilderMock();
      qb.getOne.mockResolvedValue({
        channels: [{ channelId: 'email' }, { channelId: 'telegram' }, { channelId: 'discord' }],
        userSettings: [
          { channelId: 'email', enabled: true },
          { channelId: 'telegram', enabled: true },
        ],
        connections: [
          { channelId: 'email', externalId: 'a@b.com', enabled: true },
          { channelId: 'telegram', externalId: '111', enabled: true },
          { channelId: 'discord', externalId: '222', enabled: true },
        ],
      });
      notificationsRepository.createQueryBuilder.mockReturnValue(qb);

      notificationsService.buildChannelMessage.mockImplementation((channel: { channelId: string }) => ({
        channelId: channel.channelId,
        to: 'to',
        template: { body: 'b' },
      }));

      await service.sendEventNotification(dto);

      // discord channel is filtered out before buildChannelMessage
      const builtChannelIds = notificationsService.buildChannelMessage.mock.calls.map(
        (call: [{ channelId: string }]) => call[0].channelId,
      );
      expect(builtChannelIds).toContain('email');
      expect(builtChannelIds).toContain('telegram');
      expect(builtChannelIds).not.toContain('discord');

      expect(notificationsService.publishNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationId: 'taskGrade',
          userId: 7,
          channelId: expect.arrayContaining(['email', 'telegram']),
        }),
      );
    });

    it('does not publish when no message could be built (empty channel map)', async () => {
      notificationsService.getNotification.mockResolvedValue({ enabled: true, type: 'event' });
      const qb = createQueryBuilderMock();
      qb.getOne.mockResolvedValue({
        channels: [{ channelId: 'email' }],
        userSettings: [{ channelId: 'email', enabled: true }],
        connections: [{ channelId: 'email', externalId: 'a@b.com', enabled: true }],
      });
      notificationsRepository.createQueryBuilder.mockReturnValue(qb);
      notificationsService.buildChannelMessage.mockReturnValue(undefined);

      await service.sendEventNotification(dto);

      expect(notificationsService.publishNotification).not.toHaveBeenCalled();
    });

    it('uses the connection-settings path for non-event (message) notifications', async () => {
      notificationsService.getNotification.mockResolvedValue({ enabled: true, type: 'message' });

      const qb = createQueryBuilderMock();
      qb.getMany.mockResolvedValue([
        { channelId: 'email', connection: { externalId: 'a@b.com', enabled: false } },
        { channelId: 'telegram', connection: { externalId: '111', enabled: true } },
      ]);
      channelsSettingsRepository.createQueryBuilder.mockReturnValue(qb);
      notificationsService.buildChannelMessage.mockImplementation((channel: { channelId: string }) => ({
        channelId: channel.channelId,
        to: 'to',
        template: { body: 'b' },
      }));

      await service.sendEventNotification(dto);

      // email is allowed despite enabled=false (special-cased); telegram enabled=true also passes
      expect(channelsSettingsRepository.createQueryBuilder).toHaveBeenCalledWith('channel');
      expect(notificationsService.publishNotification).toHaveBeenCalled();
    });
  });

  describe('sendEmailConfirmation', () => {
    const mockUser = { id: 7, contactsEmail: 'a@b.com' } as Partial<User> as User;

    it('returns early when the user has no contacts email', async () => {
      usersService.getUserByUserId.mockResolvedValue({ id: 7, contactsEmail: null } as User);
      authService.getLoginStateByUserId.mockResolvedValue(null);
      connectionRepository.find.mockResolvedValue([]);

      await service.sendEmailConfirmation(7);

      expect(githubService.getAuthorizeUrl).not.toHaveBeenCalled();
      expect(notificationsService.sendMessage).not.toHaveBeenCalled();
    });

    it('returns early when an enabled email connection already exists', async () => {
      usersService.getUserByUserId.mockResolvedValue(mockUser);
      authService.getLoginStateByUserId.mockResolvedValue(null);
      connectionRepository.find.mockResolvedValue([{ channelId: 'email', enabled: true }]);

      await service.sendEmailConfirmation(7);

      expect(notificationsService.sendMessage).not.toHaveBeenCalled();
    });

    it('throws when a link was sent less than a minute ago', async () => {
      usersService.getUserByUserId.mockResolvedValue(mockUser);
      authService.getLoginStateByUserId.mockResolvedValue({ createdDate: new Date() as never });
      connectionRepository.find.mockResolvedValue([]);

      await expect(service.sendEmailConfirmation(7)).rejects.toThrow(BadRequestException);
      expect(notificationsService.sendMessage).not.toHaveBeenCalled();
    });

    it('sends a confirmation message with an authorize url', async () => {
      usersService.getUserByUserId.mockResolvedValue(mockUser);
      // login state older than a minute → no throttle
      authService.getLoginStateByUserId.mockResolvedValue({
        createdDate: new Date(Date.now() - 1000 * 120) as never,
      });
      connectionRepository.find.mockResolvedValue([{ channelId: 'email', enabled: false }]);
      githubService.getAuthorizeUrl.mockResolvedValue('https://auth.example/confirm');

      await service.sendEmailConfirmation(7);

      expect(githubService.getAuthorizeUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 7,
          data: { channelId: 'email', externalId: 'a@b.com' },
        }),
      );
      expect(notificationsService.sendMessage).toHaveBeenCalledWith({
        notificationId: 'emailConfirmation',
        userId: 7,
        data: { confirmationLink: 'https://auth.example/confirm' },
        channelId: 'email',
        channelValue: 'a@b.com',
      });
    });

    it('skips the login-state lookup and throttle when checkTimeLimit is false', async () => {
      usersService.getUserByUserId.mockResolvedValue(mockUser);
      connectionRepository.find.mockResolvedValue([]);
      githubService.getAuthorizeUrl.mockResolvedValue('https://auth.example/confirm');

      await service.sendEmailConfirmation(7, false);

      expect(authService.getLoginStateByUserId).not.toHaveBeenCalled();
      expect(notificationsService.sendMessage).toHaveBeenCalled();
    });
  });
});
