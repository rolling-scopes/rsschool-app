import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';
import { WriteScoreService } from '../score';
import { UserNotificationsService } from 'src/users-notifications';
import { ConfigService } from 'src/config';

const student = { id: 31, name: 'John', githubId: 'john-doe', userId: 101 };
const courseTask = { id: 15, course: { alias: 'js-2024' }, task: { name: 'JS Task' } };
const taskSolutionResult = { id: 71, studentId: 31, checkerId: 32 };

describe('CourseCrossCheckService.saveMessage / updateMessage', () => {
  const mockUpdate = vi.fn();
  const mockGetOne = vi.fn();

  function createService() {
    const qb: any = { where: vi.fn(), getOne: mockGetOne };
    qb.where.mockReturnValue(qb);
    return new CourseCrossCheckService(
      {} as never,
      {} as never,
      { update: mockUpdate, createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
      {} as never,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-04-01T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('appends a reviewer message with read flags and author', async () => {
    mockGetOne.mockResolvedValue({ id: 71, messages: [{ content: 'old' }] });

    await createService().saveMessage(
      71,
      { content: 'hi', role: 'reviewer' as never },
      { user: { id: 102, githubId: 'kate-checker' } },
    );

    expect(mockUpdate).toHaveBeenCalledWith(71, {
      messages: [
        { content: 'old' },
        {
          content: 'hi',
          role: 'reviewer',
          timestamp: '2024-04-01T10:00:00.000Z',
          author: { id: 102, githubId: 'kate-checker' },
          isReviewerRead: true,
          isStudentRead: false,
        },
      ],
    });
  });

  it('saveMessage does nothing when result is missing', async () => {
    mockGetOne.mockResolvedValue(null);

    await createService().saveMessage(
      71,
      { content: 'hi', role: 'student' as never },
      { user: { id: 101, githubId: 'john-doe' } },
    );

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('marks all messages as reviewer-read when role is reviewer', async () => {
    mockGetOne.mockResolvedValue({
      id: 71,
      messages: [
        { content: 'a', isReviewerRead: false, isStudentRead: false },
        { content: 'b', isReviewerRead: false, isStudentRead: true },
      ],
    });

    await createService().updateMessage(71, { role: 'reviewer' as never });

    expect(mockUpdate).toHaveBeenCalledWith(71, {
      messages: [
        { content: 'a', isReviewerRead: true, isStudentRead: false },
        { content: 'b', isReviewerRead: true, isStudentRead: true },
      ],
    });
  });
});

describe('CourseCrossCheckController messages endpoints', () => {
  const mockQueryStudentByGithubId = vi.fn();
  const mockGetTaskSolutionResultById = vi.fn();
  const mockGetCourseTaskWithCourse = vi.fn();
  const mockSaveMessage = vi.fn();
  const mockUpdateMessage = vi.fn();
  const mockGetMessageRecipientId = vi.fn();
  const mockSendEventNotification = vi.fn();
  let controller: CourseCrossCheckController;

  const studentReq = { user: { id: 101, githubId: 'john-doe' } } as never;

  beforeEach(async () => {
    mockQueryStudentByGithubId.mockReset().mockResolvedValue(student);
    mockGetTaskSolutionResultById.mockReset().mockResolvedValue(taskSolutionResult);
    mockGetCourseTaskWithCourse.mockReset().mockResolvedValue(courseTask);
    mockSaveMessage.mockReset();
    mockUpdateMessage.mockReset();
    mockGetMessageRecipientId.mockReset().mockResolvedValue(202);
    mockSendEventNotification.mockReset().mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      controllers: [CourseCrossCheckController],
      providers: [
        {
          provide: CourseCrossCheckService,
          useValue: {
            queryStudentByGithubId: mockQueryStudentByGithubId,
            getTaskSolutionResultById: mockGetTaskSolutionResultById,
            getCourseTaskWithCourse: mockGetCourseTaskWithCourse,
            saveMessage: mockSaveMessage,
            updateMessage: mockUpdateMessage,
            getMessageRecipientId: mockGetMessageRecipientId,
          },
        },
        { provide: CourseTasksService, useValue: {} },
        { provide: WriteScoreService, useValue: {} },
        { provide: UserNotificationsService, useValue: { sendEventNotification: mockSendEventNotification } },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CourseCrossCheckController);
  });

  it('saves a student message and notifies the resolved recipient', async () => {
    await controller.createCrossCheckMessage(studentReq, 11, 15, 71, {
      content: 'hi reviewer',
      role: 'student' as never,
    });

    expect(mockSaveMessage).toHaveBeenCalledWith(
      71,
      { content: 'hi reviewer', role: 'student' },
      { user: { id: 101, githubId: 'john-doe' } },
    );
    expect(mockGetMessageRecipientId).toHaveBeenCalledWith(31, 32, 'student');
    expect(mockSendEventNotification).toHaveBeenCalledWith({
      userId: 202,
      notificationId: 'messages',
      data: {
        isReviewerMessage: false,
        courseAlias: 'js-2024',
        courseTaskId: 15,
        taskName: 'JS Task',
        studentGithubId: 'john-doe',
      },
    });
  });

  it('responds 400 when the student is not found', async () => {
    mockQueryStudentByGithubId.mockResolvedValue(null);
    await expect(
      controller.createCrossCheckMessage(studentReq, 11, 15, 71, { content: 'x', role: 'student' as never }),
    ).rejects.toThrow('not valid student or course');
  });

  it('responds 400 when the course task is not found', async () => {
    mockGetCourseTaskWithCourse.mockResolvedValue(null);
    await expect(
      controller.createCrossCheckMessage(studentReq, 11, 15, 71, { content: 'x', role: 'student' as never }),
    ).rejects.toThrow('not valid task');
  });

  it('responds 400 when the task solution result does not exist', async () => {
    mockGetTaskSolutionResultById.mockResolvedValue(null);
    await expect(
      controller.createCrossCheckMessage(studentReq, 11, 15, 71, { content: 'x', role: 'student' as never }),
    ).rejects.toThrow('task solution result is not exist');
  });

  it('responds 400 when a student-role user is not the solution student', async () => {
    mockQueryStudentByGithubId.mockResolvedValue({ ...student, id: 999 });
    await expect(
      controller.createCrossCheckMessage(studentReq, 11, 15, 71, { content: 'x', role: 'student' as never }),
    ).rejects.toThrow('user is not student');
  });

  it('responds 400 for an incorrect role', async () => {
    await expect(
      controller.createCrossCheckMessage(studentReq, 11, 15, 71, { content: 'x', role: 'other' as never }),
    ).rejects.toThrow('incorrect message role');
  });

  it('responds 400 when the recipient cannot be resolved', async () => {
    mockGetMessageRecipientId.mockResolvedValue(undefined);
    await expect(
      controller.createCrossCheckMessage(studentReq, 11, 15, 71, { content: 'x', role: 'student' as never }),
    ).rejects.toThrow('user not found');
  });

  it('updates messages read state for the requesting student', async () => {
    await controller.updateCrossCheckMessage(studentReq, 11, 15, 71, { role: 'student' as never });

    expect(mockUpdateMessage).toHaveBeenCalledWith(71, { role: 'student' });
  });

  it('update responds 400 for an incorrect role', async () => {
    await expect(controller.updateCrossCheckMessage(studentReq, 11, 15, 71, { role: 'nope' as never })).rejects.toThrow(
      'incorrect message role',
    );
  });
});
