import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';

const student = { id: 31, name: 'John Doe', githubId: 'john-doe', userId: 101 };
const checker = { id: 32, name: 'Kate Checker', githubId: 'kate-checker', userId: 102 };
const courseTask = { id: 15, checker: 'crossCheck', task: { id: 5 } };
const taskChecker = { id: 71, studentId: 31, checkerId: 32, courseTaskId: 15 };

const solutionComments = [
  { text: 'to all', timestamp: 1, criteriaId: 'c1', authorId: 31, recipientId: undefined },
  { text: 'from checker', timestamp: 2, criteriaId: 'c1', authorId: 32, recipientId: 31 },
  { text: 'to checker', timestamp: 3, criteriaId: 'c2', authorId: 31, recipientId: 32 },
  { text: 'foreign private', timestamp: 4, criteriaId: 'c2', authorId: 33, recipientId: 34 },
];

const reviewResult = {
  id: 81,
  score: 42,
  comment: null,
  anonymous: true,
  review: [{ percentage: 1, criteriaId: 'c1' }],
  historicalScores: null,
  messages: [{ content: 'hi' }],
};

const solution = { id: 51, studentId: 31, comments: solutionComments };

const checkerUser = { id: 102, firstName: ' Kate ', lastName: 'Checker', discord: { id: '1', username: 'kate' } };

describe('CourseCrossCheckService.getResult', () => {
  const mockResultQb: any = { where: vi.fn(), andWhere: vi.fn(), getOne: vi.fn() };
  const mockSolutionQb: any = { where: vi.fn(), andWhere: vi.fn(), getOne: vi.fn() };
  const mockStudentQb: any = { innerJoin: vi.fn(), addSelect: vi.fn(), where: vi.fn(), getMany: vi.fn() };
  const mockUserFindOne = vi.fn();

  function createService() {
    return new CourseCrossCheckService(
      {} as never,
      { createQueryBuilder: vi.fn(() => mockSolutionQb) } as never,
      { createQueryBuilder: vi.fn(() => mockResultQb) } as never,
      {} as never,
      { createQueryBuilder: vi.fn(() => mockStudentQb) } as never,
      { findOne: mockUserFindOne } as never,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    for (const qb of [mockResultQb, mockSolutionQb, mockStudentQb]) {
      for (const key of Object.keys(qb)) {
        if (!['getOne', 'getMany'].includes(key)) qb[key].mockReturnValue(qb);
      }
    }
    mockResultQb.getOne.mockResolvedValue(reviewResult);
    mockSolutionQb.getOne.mockResolvedValue(solution);
    mockStudentQb.getMany.mockResolvedValue([
      { id: 31, user: { githubId: 'john-doe' } },
      { id: 32, user: { githubId: 'kate-checker' } },
    ]);
    mockUserFindOne.mockResolvedValue(checkerUser);
  });

  it('returns the review result with visible comments and author github ids (anonymous review)', async () => {
    const service = createService();

    const result = await service.getResult(15, 31, 32, 'kate-checker');

    expect(mockUserFindOne).toHaveBeenCalledWith({ where: { githubId: 'kate-checker' } });
    expect(result).toEqual({
      id: 81,
      score: 42,
      comment: '',
      anonymous: true,
      review: [{ percentage: 1, criteriaId: 'c1' }],
      checkerId: 32,
      studentId: 31,
      author: {
        id: 102,
        name: 'Kate Checker',
        githubId: 'kate-checker',
        discord: { id: '1', username: 'kate' },
      },
      comments: [
        { text: 'to all', timestamp: 1, criteriaId: 'c1', authorId: 31, authorGithubId: 'john-doe' },
        { text: 'from checker', timestamp: 2, criteriaId: 'c1', authorId: 32, authorGithubId: 'kate-checker' },
        { text: 'to checker', timestamp: 3, criteriaId: 'c2', authorId: 31, authorGithubId: 'john-doe' },
      ],
      historicalScores: [],
      messages: [{ content: 'hi' }],
    });
  });

  it('returns null when there is no review result', async () => {
    mockResultQb.getOne.mockResolvedValue(null);

    expect(await createService().getResult(15, 31, 32, 'kate-checker')).toBeNull();
  });

  it('returns null when there is no solution', async () => {
    mockSolutionQb.getOne.mockResolvedValue(null);

    expect(await createService().getResult(15, 31, 32, 'kate-checker')).toBeNull();
  });
});

describe('CourseCrossCheckService.getTaskSolutionChecker', () => {
  it('queries the task solution checker by student, checker and course task', async () => {
    const calls: Record<string, unknown[][]> = {};
    const qb: any = {};
    for (const method of ['where', 'andWhere']) {
      qb[method] = vi.fn((...args: unknown[]) => {
        (calls[method] ??= []).push(args);
        return qb;
      });
    }
    qb.getOne = vi.fn(async () => taskChecker);
    const service = new CourseCrossCheckService(
      { createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.getTaskSolutionChecker(31, 32, 15);

    expect(calls.where).toEqual([['"taskSolutionChecker"."studentId" = :studentId', { studentId: 31 }]]);
    expect(calls.andWhere).toEqual([
      ['"taskSolutionChecker"."checkerId" = :checkerId', { checkerId: 32 }],
      ['"taskSolutionChecker"."courseTaskId" = :courseTaskId', { courseTaskId: 15 }],
    ]);
    expect(result).toBe(taskChecker);
  });
});

describe('CourseCrossCheckController.getCrossCheckTaskResult', () => {
  const mockQueryStudentByGithubId = vi.fn();
  const mockGetCourseTask = vi.fn();
  const mockGetTaskSolutionChecker = vi.fn();
  const mockGetResult = vi.fn();
  let controller: CourseCrossCheckController;

  const req = { user: { githubId: 'kate-checker' } } as never;

  beforeEach(async () => {
    mockQueryStudentByGithubId
      .mockReset()
      .mockImplementation(async (_courseId: number, githubId: string) => (githubId === 'john-doe' ? student : checker));
    mockGetCourseTask.mockReset().mockResolvedValue(courseTask);
    mockGetTaskSolutionChecker.mockReset().mockResolvedValue(taskChecker);
    mockGetResult.mockReset().mockResolvedValue(reviewResult);

    const module = await Test.createTestingModule({
      controllers: [CourseCrossCheckController],
      providers: [
        {
          provide: CourseCrossCheckService,
          useValue: {
            queryStudentByGithubId: mockQueryStudentByGithubId,
            getCourseTask: mockGetCourseTask,
            getTaskSolutionChecker: mockGetTaskSolutionChecker,
            getResult: mockGetResult,
          },
        },
        { provide: CourseTasksService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CourseCrossCheckController);
  });

  it('responds with the review result for the assigned checker', async () => {
    const result = await controller.getCrossCheckTaskResult(req, 11, 15, 'john-doe');

    expect(mockQueryStudentByGithubId).toHaveBeenCalledWith(11, 'john-doe');
    expect(mockQueryStudentByGithubId).toHaveBeenCalledWith(11, 'kate-checker');
    expect(mockGetCourseTask).toHaveBeenCalledWith(15);
    expect(mockGetTaskSolutionChecker).toHaveBeenCalledWith(31, 32, 15);
    expect(mockGetResult).toHaveBeenCalledWith(15, 31, 32, 'kate-checker');
    expect(result).toBe(reviewResult);
  });

  it('responds 400 when the student or checker is not found', async () => {
    mockQueryStudentByGithubId.mockResolvedValue(null);

    await expect(controller.getCrossCheckTaskResult(req, 11, 15, 'john-doe')).rejects.toThrow(BadRequestException);
  });

  it('responds 400 when the task is not a cross-check task', async () => {
    mockGetCourseTask.mockResolvedValue({ ...courseTask, checker: 'mentor' });

    await expect(controller.getCrossCheckTaskResult(req, 11, 15, 'john-doe')).rejects.toThrow(
      'task solution is supported for this task',
    );
  });

  it('responds 400 when there is no assigned cross-check', async () => {
    mockGetTaskSolutionChecker.mockResolvedValue(null);

    await expect(controller.getCrossCheckTaskResult(req, 11, 15, 'john-doe')).rejects.toThrow(
      'no assigned cross-check',
    );
  });

  it('responds with null when there is no review result yet', async () => {
    mockGetResult.mockResolvedValue(null);

    expect(await controller.getCrossCheckTaskResult(req, 11, 15, 'john-doe')).toBeNull();
  });
});
