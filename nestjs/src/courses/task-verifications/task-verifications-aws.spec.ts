import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskVerificationsAwsController } from './task-verifications-aws.controller';
import { TaskVerificationsService } from './task-verifications.service';
import { WriteScoreService } from '../score';

const rawVerifications = [
  {
    id: 1,
    status: 'pending',
    courseTaskId: 15,
    student: { id: 31, user: { githubId: 'john-doe' } },
    courseTask: {
      id: 15,
      task: {
        name: 'JS Task',
        githubRepoName: 'rsschool/js',
        sourceGithubRepoUrl: 'https://github.com/rsschool/js',
        attributes: { foo: 'bar' },
      },
    },
  },
];

const mappedVerifications = [
  {
    courseId: 11,
    id: 1,
    githubId: 'john-doe',
    courseTaskId: 15,
    taskName: 'JS Task',
    sourceGithubRepoUrl: 'https://github.com/rsschool/js',
    githubRepoName: 'rsschool/js',
    attributes: { foo: 'bar' },
  },
];

const savedResult = {
  id: 71,
  studentId: 31,
  courseTaskId: 15,
  details: 'looks good',
  score: 42,
  status: 'completed',
};

describe('TaskVerificationsService AWS methods', () => {
  function createFakeQueryBuilder(content: unknown[]) {
    const calls: Record<string, unknown[][]> = {};
    const qb: any = {};
    for (const method of ['select', 'innerJoin', 'addSelect', 'where', 'andWhere', 'orderBy']) {
      qb[method] = vi.fn((...args: unknown[]) => {
        (calls[method] ??= []).push(args);
        return qb;
      });
    }
    qb.getMany = vi.fn(async () => content);
    return { qb, calls };
  }

  it('getCourseTasksVerifications builds the legacy query and maps the payload', async () => {
    const { qb, calls } = createFakeQueryBuilder(rawVerifications);
    const service = new TaskVerificationsService(
      { createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.getCourseTasksVerifications(11);

    expect(calls.where).toEqual([['courseTask.courseId = :courseId', { courseId: 11 }]]);
    expect(calls.andWhere).toEqual([
      ['courseTask.disabled = :disabled', { disabled: false }],
      ["v.status = 'pending' "],
    ]);
    expect(calls.orderBy).toEqual([['v.createdDate', 'ASC']]);
    expect(result).toEqual(mappedVerifications);
  });

  it('updateVerification rounds the score, saves and refetches', async () => {
    const save = vi.fn();
    const findOneByOrFail = vi.fn().mockResolvedValue(savedResult);
    const service = new TaskVerificationsService(
      { save, findOneByOrFail } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.updateVerification(71, { score: 42.4, details: 'looks good', status: 'completed' });

    expect(save).toHaveBeenCalledWith({ score: 42, details: 'looks good', status: 'completed', id: 71 });
    expect(findOneByOrFail).toHaveBeenCalledWith({ id: 71 });
    expect(result).toBe(savedResult);
  });

  it('coerces a string score before rounding', async () => {
    const save = vi.fn();
    const findOneByOrFail = vi.fn().mockResolvedValue(savedResult);
    const service = new TaskVerificationsService(
      { save, findOneByOrFail } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await service.updateVerification(71, { score: '89.6' as never, details: 'd', status: 'completed' });

    expect(save).toHaveBeenCalledWith({ score: 90, details: 'd', status: 'completed', id: 71 });
  });
});

describe('TaskVerificationsAwsController', () => {
  const mockGetCourseTasksVerifications = vi.fn();
  const mockUpdateVerification = vi.fn();
  const mockSaveScore = vi.fn();
  let controller: TaskVerificationsAwsController;

  beforeEach(async () => {
    mockGetCourseTasksVerifications.mockReset().mockResolvedValue(mappedVerifications);
    mockUpdateVerification.mockReset().mockResolvedValue(savedResult);
    mockSaveScore.mockReset();

    const module = await Test.createTestingModule({
      controllers: [TaskVerificationsAwsController],
      providers: [
        {
          provide: TaskVerificationsService,
          useValue: {
            getCourseTasksVerifications: mockGetCourseTasksVerifications,
            updateVerification: mockUpdateVerification,
          },
        },
        { provide: WriteScoreService, useValue: { saveScore: mockSaveScore } },
      ],
    }).compile();

    controller = module.get(TaskVerificationsAwsController);
  });

  it('GET returns the verifications wrapped in the legacy { data } envelope', async () => {
    const result = await controller.getCourseTasksVerifications(11);

    expect(mockGetCourseTasksVerifications).toHaveBeenCalledWith(11);
    expect(result).toEqual({ data: mappedVerifications });
  });

  it('PUT strips createdDate, saves the score and returns the record in the { data } envelope', async () => {
    const result = await controller.updateTaskVerification(71, {
      createdDate: '2024-01-01',
      score: 42,
      details: 'looks good',
      status: 'completed',
    });

    expect(mockUpdateVerification).toHaveBeenCalledWith(71, { score: 42, details: 'looks good', status: 'completed' });
    expect(mockSaveScore).toHaveBeenCalledWith(31, 15, { comment: 'looks good', score: 42 });
    expect(result).toEqual({ data: savedResult });
  });

  it('PUT responds 400 when persistence throws', async () => {
    mockUpdateVerification.mockRejectedValue(new Error('db boom'));

    await expect(
      controller.updateTaskVerification(71, { score: 1, details: 'x', status: 'completed' }),
    ).rejects.toThrow(BadRequestException);
  });
});
