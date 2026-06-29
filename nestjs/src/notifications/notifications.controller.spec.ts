import { Test, TestingModule } from '@nestjs/testing';
import { Notification } from '@entities/notification';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';

const mockNotification = {
  id: 'taskGrade',
  name: 'Task grade',
  enabled: true,
  type: 'event',
  channels: [{ channelId: 'email', template: { subject: 's', body: 'b' } }],
  parent: { id: 'messages' },
} as Partial<Notification> as Notification;

const mockDto = {
  id: 'taskGrade',
  name: 'Task grade',
  enabled: true,
  type: 'event',
  channels: [],
} as Partial<UpdateNotificationDto> as UpdateNotificationDto;

describe('NotificationsController', () => {
  let controller: NotificationsController;
  const service = {
    getNotifications: vi.fn(),
    saveNotification: vi.fn(),
    createNotification: vi.fn(),
    deleteNotification: vi.fn(),
  };

  beforeEach(async () => {
    Object.values(service).forEach(fn => fn.mockReset());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: service }],
    }).compile();

    controller = module.get(NotificationsController);
  });

  describe('getNotifications', () => {
    it('maps service results to NotificationDto instances', async () => {
      service.getNotifications.mockResolvedValue([mockNotification]);

      const result = await controller.getNotifications();

      expect(service.getNotifications).toHaveBeenCalledWith();
      expect(result).toEqual([
        {
          id: 'taskGrade',
          name: 'Task grade',
          enabled: true,
          type: 'event',
          channels: [{ channelId: 'email', template: { subject: 's', body: 'b' } }],
          parentId: 'messages',
        },
      ]);
    });

    it('returns an empty array when there are no notifications', async () => {
      service.getNotifications.mockResolvedValue([]);

      const result = await controller.getNotifications();

      expect(result).toEqual([]);
    });
  });

  describe('updateNotification', () => {
    it('saves and wraps the result in a NotificationDto', async () => {
      service.saveNotification.mockResolvedValue(mockNotification);

      const result = await controller.updateNotification(mockDto);

      expect(service.saveNotification).toHaveBeenCalledWith(mockDto);
      expect(result).toMatchObject({ id: 'taskGrade', parentId: 'messages' });
    });
  });

  describe('createNotification', () => {
    it('creates and wraps the result in a NotificationDto', async () => {
      service.createNotification.mockResolvedValue(mockNotification);

      const result = await controller.createNotification(mockDto);

      expect(service.createNotification).toHaveBeenCalledWith(mockDto);
      expect(result).toMatchObject({ id: 'taskGrade' });
    });
  });

  describe('deleteNotification', () => {
    it('delegates to the service and returns nothing', async () => {
      service.deleteNotification.mockResolvedValue(undefined);

      const result = await controller.deleteNotification('taskGrade');

      expect(service.deleteNotification).toHaveBeenCalledWith('taskGrade');
      expect(result).toBeUndefined();
    });
  });
});
