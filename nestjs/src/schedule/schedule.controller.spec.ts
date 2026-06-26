import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

// Flush the microtask queue so the fire-and-forget notification promise runs.
const flush = () => new Promise<void>(resolve => setImmediate(resolve));

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let scheduleService: Mocked<ScheduleService>;
  let notificationService: Mocked<UserNotificationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        { provide: ScheduleService, useValue: { getChangedCoursesRecipients: vi.fn() } },
        { provide: UserNotificationsService, useValue: { sendEventNotification: vi.fn() } },
      ],
    }).compile();

    controller = module.get(ScheduleController);
    scheduleService = module.get(ScheduleService);
    notificationService = module.get(UserNotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('notifyScheduleChanges', () => {
    it('fetches recipients for the requested window and sends a notification per recipient', async () => {
      const courses = [{ course: { id: 1 }, changes: [] }];
      scheduleService.getChangedCoursesRecipients.mockResolvedValue([[42, courses]] as never);
      notificationService.sendEventNotification.mockResolvedValue(undefined as never);

      await controller.notifyScheduleChanges({ lastHours: 6 });
      await flush();

      expect(scheduleService.getChangedCoursesRecipients).toHaveBeenCalledWith(6);
      expect(notificationService.sendEventNotification).toHaveBeenCalledWith({
        data: { courses },
        notificationId: 'courseScheduleChange',
        userId: 42,
      });
    });

    it('passes undefined lastHours straight through to the service', async () => {
      scheduleService.getChangedCoursesRecipients.mockResolvedValue([] as never);

      await controller.notifyScheduleChanges({});
      await flush();

      expect(scheduleService.getChangedCoursesRecipients).toHaveBeenCalledWith(undefined);
      expect(notificationService.sendEventNotification).not.toHaveBeenCalled();
    });

    it('continues notifying remaining recipients when one notification rejects', async () => {
      scheduleService.getChangedCoursesRecipients.mockResolvedValue([
        [1, []],
        [2, []],
      ] as never);
      notificationService.sendEventNotification
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce(undefined as never);

      await controller.notifyScheduleChanges({ lastHours: 2 });
      await flush();

      expect(notificationService.sendEventNotification).toHaveBeenCalledTimes(2);
    });
  });
});
