import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CheckTasksDeadlineDto } from './dto/check-tasks-deadline';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

// The controller fires-and-forgets the notification loop inside a detached promise.
// Flushing the microtask queue lets that background work run before assertions.
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: Mocked<Pick<TasksService, 'getPendingTasksDeadline'>>;
  let notificationService: Mocked<Pick<UserNotificationsService, 'sendEventNotification'>>;

  beforeEach(async () => {
    const mockTasksService = {
      getPendingTasksDeadline: vi.fn(),
    } as Partial<TasksService> as TasksService;
    const mockNotificationService = {
      sendEventNotification: vi.fn(),
    } as Partial<UserNotificationsService> as UserNotificationsService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: mockTasksService },
        { provide: UserNotificationsService, useValue: mockNotificationService },
      ],
    }).compile();

    controller = module.get(TasksController);
    tasksService = module.get(TasksService);
    notificationService = module.get(UserNotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('notifyTasksDeadlines', () => {
    it('delegates to the tasks service using the deadlineInHours from the dto', async () => {
      tasksService.getPendingTasksDeadline.mockResolvedValue(new Map());
      const dto: CheckTasksDeadlineDto = { deadlineInHours: 36 };

      await controller.notifyTasksDeadlines(dto);

      expect(tasksService.getPendingTasksDeadline).toHaveBeenCalledWith(36);
    });

    it('returns undefined (background notification work is fire-and-forget)', async () => {
      tasksService.getPendingTasksDeadline.mockResolvedValue(new Map());
      const dto: CheckTasksDeadlineDto = { deadlineInHours: 24 };

      const result = await controller.notifyTasksDeadlines(dto);

      expect(result).toBeUndefined();
    });

    it('sends one event notification per student with their pending tasks', async () => {
      const tasksForUser1 = [{ task: { id: 10 } }];
      const tasksForUser2 = [{ task: { id: 11 } }, { task: { id: 12 } }];
      const students = new Map<number, unknown[]>([
        [100, tasksForUser1],
        [200, tasksForUser2],
      ]);
      tasksService.getPendingTasksDeadline.mockResolvedValue(students as never);
      notificationService.sendEventNotification.mockResolvedValue(undefined);

      await controller.notifyTasksDeadlines({ deadlineInHours: 24 });
      await flushMicrotasks();

      expect(notificationService.sendEventNotification).toHaveBeenCalledTimes(2);
      expect(notificationService.sendEventNotification).toHaveBeenCalledWith({
        data: { tasks: tasksForUser1 },
        notificationId: 'taskDeadline',
        userId: 100,
      });
      expect(notificationService.sendEventNotification).toHaveBeenCalledWith({
        data: { tasks: tasksForUser2 },
        notificationId: 'taskDeadline',
        userId: 200,
      });
    });

    it('does not send any notification when no students have pending tasks', async () => {
      tasksService.getPendingTasksDeadline.mockResolvedValue(new Map());

      await controller.notifyTasksDeadlines({ deadlineInHours: 24 });
      await flushMicrotasks();

      expect(notificationService.sendEventNotification).not.toHaveBeenCalled();
    });

    it('continues notifying remaining students when one notification rejects', async () => {
      const students = new Map<number, unknown[]>([
        [100, [{ task: { id: 10 } }]],
        [200, [{ task: { id: 11 } }]],
      ]);
      tasksService.getPendingTasksDeadline.mockResolvedValue(students as never);
      notificationService.sendEventNotification
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce(undefined);

      await controller.notifyTasksDeadlines({ deadlineInHours: 24 });
      await flushMicrotasks();

      // both users are attempted even though the first one throws (error is swallowed and logged)
      expect(notificationService.sendEventNotification).toHaveBeenCalledTimes(2);
      expect(notificationService.sendEventNotification).toHaveBeenCalledWith(expect.objectContaining({ userId: 100 }));
      expect(notificationService.sendEventNotification).toHaveBeenCalledWith(expect.objectContaining({ userId: 200 }));
    });
  });
});
