import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';

const student = { id: 31, name: 'John Doe', githubId: 'john-doe', userId: 101 };
const courseTask = { id: 15, task: { id: 5, name: 'JS Task' } };
const solution = {
  id: 51,
  updatedDate: '2024-04-01T10:00:00.000Z',
  url: 'https://github.com/john/solution',
  review: [{ percentage: 0.5, criteriaId: 'c1' }],
  comments: [
    { authorId: 31, recipientId: null, text: 'own comment' },
    { authorId: 31, recipientId: 32, text: 'own to recipient' },
    { authorId: 99, recipientId: null, text: 'other author' },
  ],
};

function createFakeQueryBuilder(result: unknown, methods: string[]) {
  const calls: Record<string, unknown[][]> = {};
  const qb: any = {};
  for (const method of methods) {
    qb[method] = vi.fn((...args: unknown[]) => {
      (calls[method] ??= []).push(args);
      return qb;
    });
  }
  qb.getOne = vi.fn(async () => result);
  return { qb, calls };
}

describe('CourseCrossCheckService.queryStudentByGithubId', () => {
  function setup(result: unknown) {
    const { qb, calls } = createFakeQueryBuilder(result, ['innerJoin', 'addSelect', 'where', 'andWhere']);
    const service = new CourseCrossCheckService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { createQueryBuilder: vi.fn(() => qb) } as never,
    );
    return { service, calls };
  }

  it('queries the student by githubId and courseId and maps the record', async () => {
    const { service, calls } = setup({
      id: 31,
      user: { id: 101, firstName: ' John ', lastName: 'Doe', githubId: 'john-doe' },
    });

    const result = await service.queryStudentByGithubId(11, 'john-doe');

    expect(calls.innerJoin).toEqual([['student.user', 'user']]);
    expect(calls.addSelect).toEqual([[['user.firstName', 'user.lastName', 'user.githubId', 'user.id']]]);
    expect(calls.where).toEqual([['user.githubId = :githubId', { githubId: 'john-doe' }]]);
    expect(calls.andWhere).toEqual([['student.courseId = :courseId', { courseId: 11 }]]);
    expect(result).toEqual({ id: 31, name: 'John Doe', githubId: 'john-doe', userId: 101 });
  });

  it('returns null when the student is not found', async () => {
    const { service } = setup(null);

    expect(await service.queryStudentByGithubId(11, 'missing')).toBeNull();
  });
});

describe('CourseCrossCheckService.getCourseTask', () => {
  it('builds the same query as the legacy getCourseTask', async () => {
    const { qb, calls } = createFakeQueryBuilder(courseTask, ['innerJoinAndSelect', 'where']);
    const service = new CourseCrossCheckService(
      {} as never,
      {} as never,
      {} as never,
      { createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
    );

    const result = await service.getCourseTask(15);

    expect(calls.innerJoinAndSelect).toEqual([['courseTask.task', 'task']]);
    expect(calls.where).toEqual([['courseTask.id = :courseTaskId', { courseTaskId: 15 }]]);
    expect(result).toBe(courseTask);
  });
});

describe('CourseCrossCheckController.getCrossCheckTaskSolution', () => {
  const mockQueryStudentByGithubId = vi.fn();
  const mockGetCourseTask = vi.fn();
  const mockGetTaskSolution = vi.fn();
  let controller: CourseCrossCheckController;

  const req = { user: { githubId: 'john-doe' } } as never;

  beforeEach(async () => {
    mockQueryStudentByGithubId.mockReset().mockResolvedValue(student);
    mockGetCourseTask.mockReset().mockResolvedValue(courseTask);
    mockGetTaskSolution.mockReset().mockResolvedValue(solution);

    const module = await Test.createTestingModule({
      controllers: [CourseCrossCheckController],
      providers: [
        {
          provide: CourseCrossCheckService,
          useValue: {
            queryStudentByGithubId: mockQueryStudentByGithubId,
            getCourseTask: mockGetCourseTask,
            getTaskSolution: mockGetTaskSolution,
          },
        },
        { provide: CourseTasksService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CourseCrossCheckController);
  });

  it('responds with the solution keeping only own top-level comments', async () => {
    const result = await controller.getCrossCheckTaskSolution(req, 11, 15, 'john-doe');

    expect(mockQueryStudentByGithubId).toHaveBeenCalledWith(11, 'john-doe');
    expect(mockGetCourseTask).toHaveBeenCalledWith(15);
    expect(mockGetTaskSolution).toHaveBeenCalledWith(31, 15);
    expect({ ...result }).toEqual({
      updatedDate: '2024-04-01T10:00:00.000Z',
      id: 51,
      url: 'https://github.com/john/solution',
      review: [{ percentage: 0.5, criteriaId: 'c1' }],
      studentId: 31,
      comments: [{ authorId: 31, recipientId: null, text: 'own comment' }],
    });
  });

  it('resolves the me alias and lowercases the githubId', async () => {
    await controller.getCrossCheckTaskSolution(req, 11, 15, 'me');
    expect(mockQueryStudentByGithubId).toHaveBeenLastCalledWith(11, 'john-doe');

    await controller.getCrossCheckTaskSolution(req, 11, 15, 'John-Doe');
    expect(mockQueryStudentByGithubId).toHaveBeenLastCalledWith(11, 'john-doe');
  });

  it('responds 400 when the student is not found', async () => {
    mockQueryStudentByGithubId.mockResolvedValue(null);

    await expect(controller.getCrossCheckTaskSolution(req, 11, 15, 'john-doe')).rejects.toThrow(BadRequestException);
  });

  it('responds 400 when the course task is not found', async () => {
    mockGetCourseTask.mockResolvedValue(null);

    await expect(controller.getCrossCheckTaskSolution(req, 11, 15, 'john-doe')).rejects.toThrow(BadRequestException);
  });

  it('responds 404 when the solution is not found', async () => {
    mockGetTaskSolution.mockResolvedValue(null);

    await expect(controller.getCrossCheckTaskSolution(req, 11, 15, 'john-doe')).rejects.toThrow(NotFoundException);
  });
});
