import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';
import { UserNotificationsService } from 'src/users-notifications';
import { ConfigService } from 'src/config';

const student = { id: 31, name: 'John Doe', githubId: 'john-doe', userId: 101 };
const courseTask = { id: 15, checker: 'crossCheck', studentEndDate: '2099-01-01T00:00:00.000Z' };

describe('CourseCrossCheckService.saveSolution', () => {
  const mockSave = vi.fn();
  const mockGetOne = vi.fn();

  function createService() {
    const qb: any = { where: vi.fn(), andWhere: vi.fn(), getOne: mockGetOne };
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    return new CourseCrossCheckService(
      {} as never,
      { save: mockSave, delete: vi.fn(), createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
      {} as never,
      {} as never,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges into the existing solution concatenating comments', async () => {
    mockGetOne.mockResolvedValue({
      id: 51,
      studentId: 31,
      courseTaskId: 15,
      url: 'https://old.example.com',
      comments: [{ text: 'old', criteriaId: 'c1', timestamp: 1, authorId: 31 }],
    });
    const service = createService();

    await service.saveSolution(31, 15, {
      url: 'https://new.example.com',
      comments: [{ text: 'new', criteriaId: 'c2', timestamp: 2, authorId: 31 }] as never,
    });

    expect(mockSave).toHaveBeenCalledWith({
      id: 51,
      studentId: 31,
      courseTaskId: 15,
      url: 'https://new.example.com',
      comments: [
        { text: 'old', criteriaId: 'c1', timestamp: 1, authorId: 31 },
        { text: 'new', criteriaId: 'c2', timestamp: 2, authorId: 31 },
      ],
    });
  });

  it('creates a new solution when none exists', async () => {
    mockGetOne.mockResolvedValue(null);
    const service = createService();

    await service.saveSolution(31, 15, {
      url: 'https://new.example.com',
      review: [{ percentage: 1, criteriaId: 'c1' }] as never,
      comments: [] as never,
    });

    expect(mockSave).toHaveBeenCalledWith({
      studentId: 31,
      courseTaskId: 15,
      url: 'https://new.example.com',
      review: [{ percentage: 1, criteriaId: 'c1' }],
      comments: [],
    });
  });
});

describe('CourseCrossCheckService.deleteSolution', () => {
  it('deletes the solution by studentId and courseTaskId', async () => {
    const mockDelete = vi.fn();
    const service = new CourseCrossCheckService(
      {} as never,
      { delete: mockDelete } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await service.deleteSolution(31, 15);

    expect(mockDelete).toHaveBeenCalledWith({ studentId: 31, courseTaskId: 15 });
  });
});

describe('CourseCrossCheckController solution write endpoints', () => {
  const mockQueryStudentByGithubId = vi.fn();
  const mockGetCourseTask = vi.fn();
  const mockSaveSolution = vi.fn();
  const mockDeleteSolution = vi.fn();
  let controller: CourseCrossCheckController;

  const req = { user: { githubId: 'john-doe', isAdmin: false, courses: { 11: { studentId: 31 } } } } as never;

  beforeEach(async () => {
    mockQueryStudentByGithubId.mockReset().mockResolvedValue(student);
    mockGetCourseTask.mockReset().mockResolvedValue(courseTask);
    mockSaveSolution.mockReset();
    mockDeleteSolution.mockReset();

    const module = await Test.createTestingModule({
      controllers: [CourseCrossCheckController],
      providers: [
        {
          provide: CourseCrossCheckService,
          useValue: {
            queryStudentByGithubId: mockQueryStudentByGithubId,
            getCourseTask: mockGetCourseTask,
            saveSolution: mockSaveSolution,
            deleteSolution: mockDeleteSolution,
          },
        },
        { provide: CourseTasksService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CourseCrossCheckController);
  });

  it('saves the solution stamping comments with the student id', async () => {
    await controller.createCrossCheckSolution(req, 11, 15, 'john-doe', {
      url: 'https://github.com/john/solution',
      review: [{ percentage: 0.5, criteriaId: 'c1' }] as never,
      comments: [{ text: 'note', criteriaId: 'c1', timestamp: 1 }] as never,
    });

    expect(mockQueryStudentByGithubId).toHaveBeenCalledWith(11, 'john-doe');
    expect(mockSaveSolution).toHaveBeenCalledWith(31, 15, {
      url: 'https://github.com/john/solution',
      review: [{ percentage: 0.5, criteriaId: 'c1' }],
      comments: [{ text: 'note', criteriaId: 'c1', timestamp: 1, authorId: 31 }],
    });
  });

  it('forbids submissions from expelled students', async () => {
    const expelledReq = {
      user: { githubId: 'john-doe', isAdmin: false, courses: { 11: { studentId: 31, isExpelled: true } } },
    } as never;

    await expect(
      controller.createCrossCheckSolution(expelledReq, 11, 15, 'john-doe', { url: 'https://x' } as never),
    ).rejects.toThrow(ForbiddenException);
    expect(mockSaveSolution).not.toHaveBeenCalled();
  });

  it('responds 400 when the cross-check deadline has expired', async () => {
    mockGetCourseTask.mockResolvedValue({ ...courseTask, studentEndDate: '2020-01-01T00:00:00.000Z' });

    await expect(
      controller.createCrossCheckSolution(req, 11, 15, 'john-doe', { url: 'https://x' } as never),
    ).rejects.toThrow('Cross Check deadline has expired');
    await expect(controller.deleteCrossCheckSolution(req, 11, 15, 'john-doe')).rejects.toThrow(
      'Cross Check deadline has expired',
    );
  });

  it('responds 400 when the task is not a cross-check task', async () => {
    mockGetCourseTask.mockResolvedValue({ ...courseTask, checker: 'mentor' });

    await expect(
      controller.createCrossCheckSolution(req, 11, 15, 'john-doe', { url: 'https://x' } as never),
    ).rejects.toThrow('task solution is not supported for this task');
    await expect(controller.deleteCrossCheckSolution(req, 11, 15, 'john-doe')).rejects.toThrow(
      'task solution is not supported for this task',
    );
  });

  it('responds 400 when the payload has no url', async () => {
    await expect(controller.createCrossCheckSolution(req, 11, 15, 'john-doe', { review: [] } as never)).rejects.toThrow(
      'not valid request payload',
    );
    expect(mockSaveSolution).not.toHaveBeenCalled();
  });

  it('responds 400 when the student is not found', async () => {
    mockQueryStudentByGithubId.mockResolvedValue(null);

    await expect(
      controller.createCrossCheckSolution(req, 11, 15, 'john-doe', { url: 'https://x' } as never),
    ).rejects.toThrow(BadRequestException);
    await expect(controller.deleteCrossCheckSolution(req, 11, 15, 'john-doe')).rejects.toThrow(BadRequestException);
  });

  it('deletes the solution of the student', async () => {
    await controller.deleteCrossCheckSolution(req, 11, 15, 'john-doe');

    expect(mockDeleteSolution).toHaveBeenCalledWith(31, 15);
  });

  it('forbids access to a foreign githubId for non-admins', async () => {
    await expect(
      controller.createCrossCheckSolution(req, 11, 15, 'other-user', { url: 'https://x' } as never),
    ).rejects.toThrow(ForbiddenException);
    await expect(controller.deleteCrossCheckSolution(req, 11, 15, 'other-user')).rejects.toThrow(ForbiddenException);
  });
});
