import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CrossCheckStatus } from '@entities/courseTask';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';
import { WriteScoreService } from '../score';
import { CrossCheckDistributionService } from './cross-check-distribution';

describe('CrossCheckDistributionService.distribute', () => {
  it('produces checkersNumber pairs per student, all checkers from the student set', () => {
    const service = new CrossCheckDistributionService();
    const students = [1, 2, 3, 4, 5, 6, 7];

    const pairs = service.distribute(students, 3);

    expect(pairs).toHaveLength(students.length * 3);
    for (const pair of pairs) {
      expect(students).toContain(pair.studentId);
      expect(students).toContain(pair.checkerId);
      expect(pair.checkerId).not.toBe(pair.studentId);
    }
    // every student is a checked-student exactly checkersNumber times
    for (const student of students) {
      expect(pairs.filter(p => p.studentId === student)).toHaveLength(3);
    }
  });
});

const pastTask = {
  id: 15,
  pairsCount: 3,
  crossCheckStatus: CrossCheckStatus.Distributed,
  studentEndDate: '2000-01-01',
};

describe('CourseCrossCheckController distribution/completion', () => {
  const mockGetCourseTask = vi.fn();
  const mockDistributeCrossCheck = vi.fn();
  const mockGetTaskSolutionCheckers = vi.fn();
  const mockChangeCourseTaskStatus = vi.fn();
  const mockSaveScore = vi.fn();
  let controller: CourseCrossCheckController;

  beforeEach(async () => {
    mockGetCourseTask.mockReset().mockResolvedValue(pastTask);
    mockDistributeCrossCheck.mockReset().mockResolvedValue({ crossCheckPairs: [{ studentId: 31, checkerId: 32 }] });
    mockGetTaskSolutionCheckers.mockReset().mockResolvedValue([
      { studentId: 31, score: 80 },
      { studentId: 32, score: 60 },
    ]);
    mockChangeCourseTaskStatus.mockReset();
    mockSaveScore.mockReset();

    const module = await Test.createTestingModule({
      controllers: [CourseCrossCheckController],
      providers: [
        {
          provide: CourseCrossCheckService,
          useValue: {
            getCourseTask: mockGetCourseTask,
            distributeCrossCheck: mockDistributeCrossCheck,
            getTaskSolutionCheckers: mockGetTaskSolutionCheckers,
            changeCourseTaskStatus: mockChangeCourseTaskStatus,
          },
        },
        { provide: CourseTasksService, useValue: {} },
        { provide: WriteScoreService, useValue: { saveScore: mockSaveScore } },
      ],
    }).compile();

    controller = module.get(CourseCrossCheckController);
  });

  it('distributes when the deadline has passed', async () => {
    const result = await controller.createCrossCheckDistribution(11, 15);

    expect(mockDistributeCrossCheck).toHaveBeenCalledWith(pastTask, 15);
    expect(result).toEqual({ crossCheckPairs: [{ studentId: 31, checkerId: 32 }] });
  });

  it('distribution responds 400 when the task is missing', async () => {
    mockGetCourseTask.mockResolvedValue(null);
    await expect(controller.createCrossCheckDistribution(11, 15)).rejects.toThrow(BadRequestException);
  });

  it('distribution responds 400 when the deadline has not passed', async () => {
    mockGetCourseTask.mockResolvedValue({ ...pastTask, studentEndDate: '2999-01-01' });
    await expect(controller.createCrossCheckDistribution(11, 15)).rejects.toThrow(BadRequestException);
    expect(mockDistributeCrossCheck).not.toHaveBeenCalled();
  });

  it('writes averaged cross-check scores and completes the task', async () => {
    await controller.createCrossCheckCompletion(11, 15);

    // pairsCount = max(3 - 1, 1) = 2
    expect(mockGetTaskSolutionCheckers).toHaveBeenCalledWith(15, 2);
    expect(mockSaveScore).toHaveBeenCalledWith(31, 15, { authorId: -1, comment: 'Cross-Check score', score: 80 });
    expect(mockSaveScore).toHaveBeenCalledWith(32, 15, { authorId: -1, comment: 'Cross-Check score', score: 60 });
    expect(mockChangeCourseTaskStatus).toHaveBeenCalledWith(pastTask, CrossCheckStatus.Completed);
  });

  it('completion defaults pairsCount to 4 (minCheckedCount 3) when not set', async () => {
    mockGetCourseTask.mockResolvedValue({ ...pastTask, pairsCount: null });
    mockGetTaskSolutionCheckers.mockResolvedValue([]);

    await controller.createCrossCheckCompletion(11, 15);

    expect(mockGetTaskSolutionCheckers).toHaveBeenCalledWith(15, 3);
  });

  it('completion responds 400 when status is initial', async () => {
    mockGetCourseTask.mockResolvedValue({ ...pastTask, crossCheckStatus: CrossCheckStatus.Initial });
    await expect(controller.createCrossCheckCompletion(11, 15)).rejects.toThrow(BadRequestException);
    expect(mockChangeCourseTaskStatus).not.toHaveBeenCalled();
  });

  it('completion responds 400 when the deadline has not passed', async () => {
    mockGetCourseTask.mockResolvedValue({ ...pastTask, studentEndDate: '2999-01-01' });
    await expect(controller.createCrossCheckCompletion(11, 15)).rejects.toThrow(BadRequestException);
  });
});
