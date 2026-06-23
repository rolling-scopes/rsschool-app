import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';
import { WriteScoreService } from '../score';
import { UserNotificationsService } from 'src/users-notifications';
import { ConfigService } from 'src/config';

const student = { id: 31, name: 'John Doe', githubId: 'john-doe', userId: 101 };
const checker = { id: 32, name: 'Kate Checker', githubId: 'kate-checker', userId: 102 };
const courseTask = {
  id: 15,
  checker: 'crossCheck',
  crossCheckStatus: 'distributed',
  maxScore: 100,
  course: { alias: 'js-2024' },
};
const taskChecker = { id: 71, studentId: 31, checkerId: 32, courseTaskId: 15 };
const previousScore = { id: 81, score: 10, comment: 'old' };

const body = {
  score: '42.4' as never,
  comment: 'good job',
  anonymous: false,
  review: [{ percentage: 1, criteriaId: 'c1' }],
  comments: [{ text: 'note', criteriaId: 'c1', timestamp: 1 }],
  criteria: [{ key: 'c1', max: 50, text: 'Quality', type: 'subtask' }],
};

describe('CourseCrossCheckService.saveResult', () => {
  const mockUpdate = vi.fn();
  const mockInsert = vi.fn();
  const mockGetOne = vi.fn();
  const data = { score: 42, comment: 'good job', anonymous: false, review: [] as never[] };
  const criteria = body.criteria as never[];

  function createService() {
    const qb: any = { where: vi.fn(), andWhere: vi.fn(), getOne: mockGetOne };
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    return new CourseCrossCheckService(
      {} as never,
      { save: vi.fn() } as never,
      { update: mockUpdate, insert: mockInsert, createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
      {} as never,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates the existing result and returns the previous score when changed', async () => {
    const existing = { id: 81, score: 10, comment: 'old', historicalScores: [{ score: 10 }] };
    mockGetOne.mockResolvedValue(existing);
    const service = createService();

    const previous = await service.saveResult(15, 31, 32, data, { userId: 102, criteria });

    expect(mockUpdate).toHaveBeenCalledWith(81, {
      ...data,
      historicalScores: [{ score: 10 }, { ...data, criteria, authorId: 102, dateTime: 1700000000000 }],
    });
    expect(previous).toEqual({ ...existing, historicalScores: existing.historicalScores });
  });

  it('returns undefined when score and comment did not change', async () => {
    mockGetOne.mockResolvedValue({ id: 81, score: 42, comment: 'good job', historicalScores: [] });
    const service = createService();

    const previous = await service.saveResult(15, 31, 32, data, { userId: 102, criteria });

    expect(mockUpdate).toHaveBeenCalled();
    expect(previous).toBeUndefined();
  });

  it('inserts a new result when none exists', async () => {
    mockGetOne.mockResolvedValue(null);
    const service = createService();

    const previous = await service.saveResult(15, 31, 32, data, { userId: 102, criteria });

    expect(mockInsert).toHaveBeenCalledWith({
      studentId: 31,
      checkerId: 32,
      courseTaskId: 15,
      historicalScores: [{ ...data, criteria, authorId: 102, dateTime: 1700000000000 }],
      messages: [],
      ...data,
    });
    expect(previous).toBeUndefined();
  });
});

describe('CourseCrossCheckService.saveSolutionComments', () => {
  const mockSave = vi.fn();
  const mockGetOne = vi.fn();

  function createService() {
    const qb: any = { where: vi.fn(), andWhere: vi.fn(), getOne: mockGetOne };
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    return new CourseCrossCheckService(
      {} as never,
      { save: mockSave, createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
      {} as never,
      {} as never,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('appends new comments with author and recipient, deduplicating by criteriaId+timestamp', async () => {
    mockGetOne.mockResolvedValue({
      id: 51,
      comments: [{ text: 'old', criteriaId: 'c1', timestamp: 1, authorId: 31 }],
    });
    const service = createService();

    await service.saveSolutionComments(31, 15, {
      comments: [
        { text: 'dup', criteriaId: 'c1', timestamp: 1 },
        { text: 'new', criteriaId: 'c2', timestamp: 2 },
      ] as never[],
      authorId: 32,
      authorGithubId: 'kate-checker',
      recipientId: 31,
    });

    expect(mockSave).toHaveBeenCalledWith({
      id: 51,
      comments: [
        { text: 'old', criteriaId: 'c1', timestamp: 1, authorId: 31 },
        { text: 'new', criteriaId: 'c2', timestamp: 2, authorId: 32, recipientId: 31 },
      ],
    });
  });

  it('throws when the solution is not found', async () => {
    mockGetOne.mockResolvedValue(null);
    const service = createService();

    await expect(
      service.saveSolutionComments(31, 15, {
        comments: [] as never[],
        authorId: 32,
        authorGithubId: 'kate-checker',
      }),
    ).rejects.toThrow('Cross check solution not found');
  });
});

describe('CourseCrossCheckController.createCrossCheckResult', () => {
  const mockQueryStudentByGithubId = vi.fn();
  const mockGetCourseTaskWithCourse = vi.fn();
  const mockGetTaskSolutionChecker = vi.fn();
  const mockSaveResult = vi.fn();
  const mockSaveSolutionComments = vi.fn();
  const mockSendEventNotification = vi.fn();
  let controller: CourseCrossCheckController;

  const req = { user: { id: 102, githubId: 'kate-checker', isAdmin: false } } as never;

  beforeEach(async () => {
    mockQueryStudentByGithubId
      .mockReset()
      .mockImplementation(async (_courseId: number, githubId: string) => (githubId === 'john-doe' ? student : checker));
    mockGetCourseTaskWithCourse.mockReset().mockResolvedValue(courseTask);
    mockGetTaskSolutionChecker.mockReset().mockResolvedValue(taskChecker);
    mockSaveResult.mockReset().mockResolvedValue(previousScore);
    mockSaveSolutionComments.mockReset();
    mockSendEventNotification.mockReset();

    const module = await Test.createTestingModule({
      controllers: [CourseCrossCheckController],
      providers: [
        {
          provide: CourseCrossCheckService,
          useValue: {
            queryStudentByGithubId: mockQueryStudentByGithubId,
            getCourseTaskWithCourse: mockGetCourseTaskWithCourse,
            getTaskSolutionChecker: mockGetTaskSolutionChecker,
            saveResult: mockSaveResult,
            saveSolutionComments: mockSaveSolutionComments,
          },
        },
        { provide: CourseTasksService, useValue: {} },
        { provide: WriteScoreService, useValue: {} },
        { provide: UserNotificationsService, useValue: { sendEventNotification: mockSendEventNotification } },
        { provide: ConfigService, useValue: { host: 'https://app.rs.school' } },
      ],
    }).compile();

    controller = module.get(CourseCrossCheckController);
  });

  it('saves the result, comments and sends the taskGrade notification', async () => {
    await controller.createCrossCheckResult(req, 11, 15, 'john-doe', body as never);

    expect(mockGetTaskSolutionChecker).toHaveBeenCalledWith(31, 32, 15);
    expect(mockSaveResult).toHaveBeenCalledWith(
      15,
      31,
      32,
      { score: 42, comment: 'good job', anonymous: false, review: [{ percentage: 1, criteriaId: 'c1' }] },
      { userId: 102, criteria: body.criteria },
    );
    expect(mockSaveSolutionComments).toHaveBeenCalledWith(31, 15, {
      comments: body.comments,
      authorId: 32,
      authorGithubId: 'kate-checker',
      recipientId: 31,
    });
    expect(mockSendEventNotification).toHaveBeenCalledWith({
      userId: 101,
      notificationId: 'taskGrade',
      data: {
        previousScore,
        courseTask,
        score: 42,
        comment: 'good job',
        resultLink: 'https://app.rs.school/course/student/cross-check-submit?course=js-2024&taskId=15',
      },
    });
  });

  it('defaults anonymous to true and review to empty array', async () => {
    await controller.createCrossCheckResult(req, 11, 15, 'john-doe', {
      score: 5,
      comment: '',
      review: 'oops',
      criteria: [],
    } as never);

    expect(mockSaveResult).toHaveBeenCalledWith(
      15,
      31,
      32,
      { score: 5, comment: '', anonymous: true, review: [] },
      expect.anything(),
    );
  });

  it('responds 400 when the task is not distributed', async () => {
    mockGetCourseTaskWithCourse.mockResolvedValue({ ...courseTask, crossCheckStatus: 'initial' });

    await expect(controller.createCrossCheckResult(req, 11, 15, 'john-doe', body as never)).rejects.toThrow(
      "task review can't be submitted",
    );
  });

  it('responds 400 when there is no assigned cross-check', async () => {
    mockGetTaskSolutionChecker.mockResolvedValue(null);

    await expect(controller.createCrossCheckResult(req, 11, 15, 'john-doe', body as never)).rejects.toThrow(
      'no assigned cross-check',
    );
  });

  it('responds 400 when the score is greater than max score', async () => {
    await expect(
      controller.createCrossCheckResult(req, 11, 15, 'john-doe', { ...body, score: 1000 } as never),
    ).rejects.toThrow('score provided is greater than max score for the task');
  });

  it('responds 400 when no valid score is provided', async () => {
    await expect(
      controller.createCrossCheckResult(req, 11, 15, 'john-doe', { ...body, score: 'abc' } as never),
    ).rejects.toThrow('no score provided');
  });
});
