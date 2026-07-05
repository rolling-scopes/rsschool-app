import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CurrentRequest } from 'src/auth';
import { User } from '@entities/user';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { UsersNotificationsController } from './users.notifications.controller';
import { UserNotificationsService } from './users.notifications.service';
import { AuthService } from '../auth';
import { UsersService } from '../users/users.service';

const req = (id: number) => ({ user: { id } }) as Partial<CurrentRequest> as CurrentRequest;

describe('UsersNotificationsController', () => {
  let controller: UsersNotificationsController;
  const userNotificationsService = {
    getUserNotificationsSettings: vi.fn(),
    getUserConnections: vi.fn(),
    saveUserNotificationSettings: vi.fn(),
    sendEmailConfirmation: vi.fn(),
    getUserConnection: vi.fn(),
    saveUserConnection: vi.fn(),
    sendEventNotification: vi.fn(),
  };
  const authService = { getLoginStateByUserId: vi.fn() };
  const usersService = { getUserByUserId: vi.fn() };

  beforeEach(async () => {
    Object.values(userNotificationsService).forEach(fn => fn.mockReset());
    authService.getLoginStateByUserId.mockReset();
    usersService.getUserByUserId.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersNotificationsController],
      providers: [
        { provide: UserNotificationsService, useValue: userNotificationsService },
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get(UsersNotificationsController);
  });

  describe('getUserConnections', () => {
    it('maps connections to a keyed dto and attaches lastLinkSentAt for the matching channel', async () => {
      userNotificationsService.getUserConnections.mockResolvedValue([
        { channelId: 'email', externalId: 'a@b.com', enabled: true },
        { channelId: 'telegram', externalId: '111', enabled: false },
      ]);
      const createdDate = new Date();
      authService.getLoginStateByUserId.mockResolvedValue({ data: { channelId: 'email' }, createdDate });
      usersService.getUserByUserId.mockResolvedValue({ discord: null } as User);

      const result = await controller.getUserConnections(req(7));

      expect(result.connections.email).toEqual({
        value: 'a@b.com',
        enabled: true,
        lastLinkSentAt: createdDate,
      });
      // telegram channel does not match the last link channel → undefined
      expect(result.connections.telegram).toEqual({
        value: '111',
        enabled: false,
        lastLinkSentAt: undefined,
      });
      expect(result.connections.discord).toBeUndefined();
    });

    it('adds a synthetic always-enabled discord connection from the profile', async () => {
      userNotificationsService.getUserConnections.mockResolvedValue([]);
      authService.getLoginStateByUserId.mockResolvedValue(null);
      usersService.getUserByUserId.mockResolvedValue({ discord: { id: 999 } } as Partial<User> as User);

      const result = await controller.getUserConnections(req(7));

      expect(result.connections.discord).toEqual({ value: '999', enabled: true });
    });

    it('omits lastLinkSentAt when there is no last login state', async () => {
      userNotificationsService.getUserConnections.mockResolvedValue([
        { channelId: 'email', externalId: 'a@b.com', enabled: true },
      ]);
      authService.getLoginStateByUserId.mockResolvedValue(null);
      usersService.getUserByUserId.mockResolvedValue({ discord: null } as User);

      const result = await controller.getUserConnections(req(7));

      expect(result.connections.email.lastLinkSentAt).toBeUndefined();
    });
  });

  describe('getUserNotifications', () => {
    it('combines settings and connections into the response shape', async () => {
      userNotificationsService.getUserNotificationsSettings.mockResolvedValue([
        { id: 'taskGrade', name: 'Task grade', enabled: true, settings: [{ channelId: 'email', enabled: true }] },
      ]);
      userNotificationsService.getUserConnections.mockResolvedValue([]);
      authService.getLoginStateByUserId.mockResolvedValue(null);
      usersService.getUserByUserId.mockResolvedValue({ discord: null } as User);

      const result = await controller.getUserNotifications(req(7));

      expect(userNotificationsService.getUserNotificationsSettings).toHaveBeenCalledWith(7);
      expect(result.notifications).toEqual([
        { id: 'taskGrade', name: 'Task grade', enabled: true, settings: { email: true } },
      ]);
      expect(result.connections).toEqual({});
    });
  });

  describe('updateUserNotifications', () => {
    it('delegates to the service with the user id and dto', async () => {
      userNotificationsService.saveUserNotificationSettings.mockResolvedValue(undefined);
      const dto = [{ notificationId: 'taskGrade', channelId: 'email' as const, enabled: true }];

      await controller.updateUserNotifications(req(7), dto);

      expect(userNotificationsService.saveUserNotificationSettings).toHaveBeenCalledWith(7, dto);
    });
  });

  describe('sendEmailConfirmation', () => {
    it('delegates to the service with the user id', async () => {
      userNotificationsService.sendEmailConfirmation.mockResolvedValue(undefined);

      await controller.sendEmailConfirmation(req(7));

      expect(userNotificationsService.sendEmailConfirmation).toHaveBeenCalledWith(7);
    });
  });

  describe('findConnection', () => {
    it('returns a NotificationConnectionDto when found', async () => {
      const connection = {
        channelId: 'email',
        externalId: 'a@b.com',
        userId: 7,
        enabled: true,
      } as Partial<NotificationUserConnection> as NotificationUserConnection;
      userNotificationsService.getUserConnection.mockResolvedValue(connection);

      const result = await controller.findConnection({ channelId: 'email', externalId: 'a@b.com' });

      expect(result).toMatchObject({ channelId: 'email', externalId: 'a@b.com', userId: 7, enabled: true });
    });

    it('throws NotFoundException when there is no connection', async () => {
      userNotificationsService.getUserConnection.mockResolvedValue(null);

      await expect(controller.findConnection({ channelId: 'email' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUserConnection', () => {
    it('saves the connection and wraps it in a NotificationConnectionDto', async () => {
      const saved = {
        channelId: 'email',
        externalId: 'a@b.com',
        userId: 7,
        enabled: true,
      } as Partial<NotificationUserConnection> as NotificationUserConnection;
      userNotificationsService.saveUserConnection.mockResolvedValue(saved);
      const dto = { channelId: 'email' as const, externalId: 'a@b.com', userId: 7, enabled: true };

      const result = await controller.createUserConnection(dto);

      expect(userNotificationsService.saveUserConnection).toHaveBeenCalledWith(dto);
      expect(result).toMatchObject({ channelId: 'email', userId: 7 });
    });
  });

  describe('sendNotification', () => {
    it('delegates to the service', async () => {
      userNotificationsService.sendEventNotification.mockResolvedValue(undefined);
      const dto = { notificationId: 'taskGrade' as const, userId: 7, data: {} };

      await controller.sendNotification(dto);

      expect(userNotificationsService.sendEventNotification).toHaveBeenCalledWith(dto);
    });
  });
});
