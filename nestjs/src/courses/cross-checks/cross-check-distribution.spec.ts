import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CrossCheckStatus } from '@entities/courseTask';
import { CourseCrossCheckService } from './course-cross-checks.service';
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

// Orchestration lives in CourseCrossCheckService (shared by the controller endpoints and the daily cron).
describe('CourseCrossCheckService runDistribution/runCompletion', () => {
  let service: CourseCrossCheckService;
  const mockSaveScore = vi.fn();

  beforeEach(() => {
    service = new CourseCrossCheckService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { saveScore: mockSaveScore } as never,
    );
    vi.spyOn(service, 'getCourseTask').mockResolvedValue(pastTask as never);
    vi.spyOn(service, 'distributeCrossCheck').mockResolvedValue({
      crossCheckPairs: [{ studentId: 31, checkerId: 32 }],
    } as never);
    vi.spyOn(service, 'getTaskSolutionCheckers').mockResolvedValue([
      { studentId: 31, score: 80 },
      { studentId: 32, score: 60 },
    ]);
    vi.spyOn(service, 'changeCourseTaskStatus').mockResolvedValue(undefined as never);
    mockSaveScore.mockReset();
  });

  it('distributes when the deadline has passed', async () => {
    const result = await service.runDistribution(15);

    expect(service.distributeCrossCheck).toHaveBeenCalledWith(pastTask, 15);
    expect(result).toEqual({ crossCheckPairs: [{ studentId: 31, checkerId: 32 }] });
  });

  it('distribution responds 400 when the task is missing', async () => {
    vi.spyOn(service, 'getCourseTask').mockResolvedValue(null as never);
    await expect(service.runDistribution(15)).rejects.toThrow(BadRequestException);
  });

  it('distribution responds 400 when the deadline has not passed', async () => {
    vi.spyOn(service, 'getCourseTask').mockResolvedValue({ ...pastTask, studentEndDate: '2999-01-01' } as never);
    await expect(service.runDistribution(15)).rejects.toThrow(BadRequestException);
    expect(service.distributeCrossCheck).not.toHaveBeenCalled();
  });

  it('writes averaged cross-check scores and completes the task', async () => {
    await service.runCompletion(15);

    // pairsCount = max(3 - 1, 1) = 2
    expect(service.getTaskSolutionCheckers).toHaveBeenCalledWith(15, 2);
    expect(mockSaveScore).toHaveBeenCalledWith(31, 15, { authorId: -1, comment: 'Cross-Check score', score: 80 });
    expect(mockSaveScore).toHaveBeenCalledWith(32, 15, { authorId: -1, comment: 'Cross-Check score', score: 60 });
    expect(service.changeCourseTaskStatus).toHaveBeenCalledWith(pastTask, CrossCheckStatus.Completed);
  });

  it('completion defaults pairsCount to 4 (minCheckedCount 3) when not set', async () => {
    vi.spyOn(service, 'getCourseTask').mockResolvedValue({ ...pastTask, pairsCount: null } as never);
    vi.spyOn(service, 'getTaskSolutionCheckers').mockResolvedValue([]);

    await service.runCompletion(15);

    expect(service.getTaskSolutionCheckers).toHaveBeenCalledWith(15, 3);
  });

  it('completion responds 400 when status is initial', async () => {
    vi.spyOn(service, 'getCourseTask').mockResolvedValue({
      ...pastTask,
      crossCheckStatus: CrossCheckStatus.Initial,
    } as never);
    await expect(service.runCompletion(15)).rejects.toThrow(BadRequestException);
    expect(service.changeCourseTaskStatus).not.toHaveBeenCalled();
  });

  it('completion responds 400 when the deadline has not passed', async () => {
    vi.spyOn(service, 'getCourseTask').mockResolvedValue({ ...pastTask, studentEndDate: '2999-01-01' } as never);
    await expect(service.runCompletion(15)).rejects.toThrow(BadRequestException);
  });
});
