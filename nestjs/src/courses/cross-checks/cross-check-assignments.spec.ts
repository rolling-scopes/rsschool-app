import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';

const checkerStudent = { id: 32, name: 'Kate Checker', githubId: 'kate-checker', userId: 102 };
const courseTask = { id: 15, checker: 'crossCheck', task: { id: 5 } };

const assignmentRecords = [
  {
    student: {
      id: 31,
      isExpelled: false,
      isFailed: false,
      totalScore: 90.5,
      user: {
        id: 101,
        firstName: ' John ',
        lastName: 'Doe',
        githubId: 'john-doe',
        cityName: 'Minsk',
        countryName: 'Belarus',
        discord: { id: '1', username: 'john' },
      },
    },
    taskSolution: { url: 'https://github.com/john/solution' },
  },
  {
    student: {
      id: 33,
      isExpelled: true,
      isFailed: false,
      totalScore: 0,
      user: {
        id: 103,
        firstName: 'Jane',
        lastName: null,
        githubId: 'jane-roe',
        cityName: null,
        countryName: null,
        discord: null,
      },
    },
    taskSolution: { url: 'https://github.com/jane/solution' },
  },
];

const expectedAssignments = [
  {
    student: {
      name: 'John Doe',
      isActive: true,
      id: 31,
      githubId: 'john-doe',
      mentor: null,
      cityName: 'Minsk',
      countryName: 'Belarus',
      discord: { id: '1', username: 'john' },
      totalScore: 90.5,
    },
    url: 'https://github.com/john/solution',
  },
  {
    student: {
      name: 'Jane',
      isActive: false,
      id: 33,
      githubId: 'jane-roe',
      mentor: null,
      cityName: '',
      countryName: '',
      discord: null,
      totalScore: 0,
    },
    url: 'https://github.com/jane/solution',
  },
];

describe('CourseCrossCheckService.getTaskSolutionAssignments', () => {
  it('queries assignments with solution, student and primary user fields', async () => {
    const calls: Record<string, unknown[][]> = {};
    const qb: any = {};
    for (const method of ['innerJoinAndSelect', 'innerJoin', 'addSelect', 'where', 'andWhere']) {
      qb[method] = vi.fn((...args: unknown[]) => {
        (calls[method] ??= []).push(args);
        return qb;
      });
    }
    const records = [{ student: { id: 31 }, taskSolution: { url: 'u' } }];
    qb.getMany = vi.fn(async () => records);
    const service = new CourseCrossCheckService(
      { createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.getTaskSolutionAssignments(32, 15);

    expect(calls.innerJoinAndSelect).toEqual([
      ['taskSolutionChecker.taskSolution', 'taskSolution'],
      ['taskSolutionChecker.student', 'student'],
    ]);
    expect(calls.innerJoin).toEqual([['student.user', 'user']]);
    expect(calls.addSelect).toEqual([
      [
        [
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.githubId',
          'user.cityName',
          'user.countryName',
          'user.discord',
        ],
      ],
    ]);
    expect(calls.where).toEqual([['"taskSolutionChecker"."checkerId" = :checkerId', { checkerId: 32 }]]);
    expect(calls.andWhere).toEqual([['"taskSolutionChecker"."courseTaskId" = :courseTaskId', { courseTaskId: 15 }]]);
    expect(result).toBe(records);
  });
});

describe('CourseCrossCheckController.getCrossCheckAssignments', () => {
  const mockQueryStudentByGithubId = vi.fn();
  const mockGetCourseTask = vi.fn();
  const mockGetTaskSolutionAssignments = vi.fn();
  let controller: CourseCrossCheckController;

  const req = { user: { githubId: 'kate-checker', isAdmin: false } } as never;

  beforeEach(async () => {
    mockQueryStudentByGithubId.mockReset().mockResolvedValue(checkerStudent);
    mockGetCourseTask.mockReset().mockResolvedValue(courseTask);
    mockGetTaskSolutionAssignments.mockReset().mockResolvedValue(assignmentRecords);

    const module = await Test.createTestingModule({
      controllers: [CourseCrossCheckController],
      providers: [
        {
          provide: CourseCrossCheckService,
          useValue: {
            queryStudentByGithubId: mockQueryStudentByGithubId,
            getCourseTask: mockGetCourseTask,
            getTaskSolutionAssignments: mockGetTaskSolutionAssignments,
          },
        },
        { provide: CourseTasksService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CourseCrossCheckController);
  });

  it('responds with assigned solutions mapped to student basic + url', async () => {
    const result = await controller.getCrossCheckAssignments(req, 11, 15, 'kate-checker');

    expect(mockQueryStudentByGithubId).toHaveBeenCalledWith(11, 'kate-checker');
    expect(mockGetCourseTask).toHaveBeenCalledWith(15);
    expect(mockGetTaskSolutionAssignments).toHaveBeenCalledWith(32, 15);
    expect(result).toEqual(expectedAssignments);
  });

  it('resolves the me alias and forbids access to other users for non-admins', async () => {
    await controller.getCrossCheckAssignments(req, 11, 15, 'me');
    expect(mockQueryStudentByGithubId).toHaveBeenLastCalledWith(11, 'kate-checker');

    await expect(controller.getCrossCheckAssignments(req, 11, 15, 'john-doe')).rejects.toThrow(ForbiddenException);

    const adminReq = { user: { githubId: 'admin-user', isAdmin: true } } as never;
    mockQueryStudentByGithubId.mockResolvedValue(checkerStudent);
    await controller.getCrossCheckAssignments(adminReq, 11, 15, 'John-Doe');
    expect(mockQueryStudentByGithubId).toHaveBeenLastCalledWith(11, 'john-doe');
  });

  it('responds 400 when the student is not found', async () => {
    mockQueryStudentByGithubId.mockResolvedValue(null);

    await expect(controller.getCrossCheckAssignments(req, 11, 15, 'kate-checker')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('responds 400 when the task is not a cross-check task', async () => {
    mockGetCourseTask.mockResolvedValue({ ...courseTask, checker: 'mentor' });

    await expect(controller.getCrossCheckAssignments(req, 11, 15, 'kate-checker')).rejects.toThrow(
      'not supported task',
    );
  });
});
