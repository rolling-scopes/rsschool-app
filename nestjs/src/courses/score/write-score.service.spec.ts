import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskResult } from '@entities/taskResult';
import { WriteScoreService } from './write-score.service';

// A persisted TaskResult as returned by the repository for the "update" path.
// Only the fields touched by WriteScoreService are populated.
const mockExistingResult = {
  id: 555,
  studentId: 10,
  courseTaskId: 20,
  score: 50,
  comment: 'old comment',
  githubRepoUrl: 'https://repo',
  githubPrUrl: 'https://pr/old',
  historicalScores: [],
  lastCheckerId: 7,
} as Partial<TaskResult> as TaskResult;

describe('WriteScoreService', () => {
  let service: WriteScoreService;
  let taskResultRepository: Mocked<Repository<TaskResult>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WriteScoreService,
        {
          provide: getRepositoryToken(TaskResult),
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WriteScoreService>(WriteScoreService);
    taskResultRepository = module.get(getRepositoryToken(TaskResult));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveScoreWithStatus', () => {
    describe('when no existing task result (create path)', () => {
      beforeEach(() => {
        taskResultRepository.findOne.mockResolvedValue(null);
        taskResultRepository.save.mockResolvedValue({} as TaskResult);
      });

      it('looks up the current result by studentId and courseTaskId', async () => {
        await service.saveScoreWithStatus(10, 20, { score: 90, comment: 'great' });

        expect(taskResultRepository.findOne).toHaveBeenCalledWith({
          where: { studentId: 10, courseTaskId: 20 },
        });
      });

      it('saves a new result with raw (unrounded) score/comment/url and a historical record', async () => {
        const before = Date.now();
        await service.saveScoreWithStatus(10, 20, {
          authorId: 3,
          score: 89.6,
          comment: 'great',
          githubPrUrl: 'https://pr',
        });
        const after = Date.now();

        expect(taskResultRepository.save).toHaveBeenCalledTimes(1);
        const saved = taskResultRepository.save.mock.calls[0][0] as Partial<TaskResult>;
        expect(saved).toMatchObject({
          courseTaskId: 20,
          studentId: 10,
          score: 89.6, // raw, not rounded, on create
          comment: 'great',
          githubPrUrl: 'https://pr',
          lastCheckerId: 3,
        });
        expect(saved.historicalScores).toHaveLength(1);
        const record = saved.historicalScores![0]!;
        expect(record).toMatchObject({ authorId: 3, score: 89.6, comment: 'great' });
        expect(record.dateTime).toBeGreaterThanOrEqual(before);
        expect(record.dateTime).toBeLessThanOrEqual(after);
      });

      it('returns { created: true } and no previousScore', async () => {
        const result = await service.saveScoreWithStatus(10, 20, { score: 90, comment: 'great' });

        expect(result).toEqual({ created: true });
      });

      it('sets lastCheckerId to undefined when authorId is not provided (defaults to 0)', async () => {
        await service.saveScoreWithStatus(10, 20, { score: 90, comment: 'great' });

        const saved = taskResultRepository.save.mock.calls[0][0] as Partial<TaskResult>;
        expect(saved.lastCheckerId).toBeUndefined();
        expect(saved.historicalScores![0]!.authorId).toBe(0);
      });

      it('sets lastCheckerId to undefined when authorId is 0 (not > 0)', async () => {
        await service.saveScoreWithStatus(10, 20, { authorId: 0, score: 90, comment: 'great' });

        const saved = taskResultRepository.save.mock.calls[0][0] as Partial<TaskResult>;
        expect(saved.lastCheckerId).toBeUndefined();
      });

      it('passes githubPrUrl through as undefined when not provided', async () => {
        await service.saveScoreWithStatus(10, 20, { score: 90, comment: 'great' });

        const saved = taskResultRepository.save.mock.calls[0][0] as Partial<TaskResult>;
        expect(saved.githubPrUrl).toBeUndefined();
      });

      it('does not call update on the create path', async () => {
        await service.saveScoreWithStatus(10, 20, { score: 90, comment: 'great' });

        expect(taskResultRepository.update).not.toHaveBeenCalled();
      });
    });

    describe('when an existing result is unchanged (no-op path)', () => {
      it('returns { created: true } and persists nothing when url, comment and rounded score all match', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          githubRepoUrl: 'https://pr', // compared against incoming githubPrUrl
          comment: 'same',
          score: 50,
        } as TaskResult);

        const result = await service.saveScoreWithStatus(10, 20, {
          score: 49.6, // rounds to 50, equals current.score
          comment: 'same',
          githubPrUrl: 'https://pr',
        });

        expect(result).toEqual({ created: true });
        expect(taskResultRepository.update).not.toHaveBeenCalled();
        expect(taskResultRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('when an existing result changes (update path)', () => {
      beforeEach(() => {
        taskResultRepository.update.mockResolvedValue({} as never);
      });

      it('updates score, appends a historical record, and updates lastCheckerId when authorId > 0', async () => {
        taskResultRepository.findOne.mockResolvedValue({ ...mockExistingResult, historicalScores: [] } as TaskResult);

        const result = await service.saveScoreWithStatus(10, 20, {
          authorId: 99,
          score: 80,
          comment: 'updated',
        });

        expect(taskResultRepository.update).toHaveBeenCalledTimes(1);
        const [id, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        expect(id).toBe(555);
        expect(patch).toMatchObject({
          score: 80,
          comment: 'updated',
          lastCheckerId: 99,
        });
        expect(patch.historicalScores).toHaveLength(1);
        expect(result.created).toBe(false);
      });

      it('returns previousScore as a snapshot of the result before mutation', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          score: 50,
          comment: 'old comment',
        } as TaskResult);

        const result = await service.saveScoreWithStatus(10, 20, { score: 80, comment: 'updated' });

        expect(result.previousScore).toMatchObject({ id: 555, score: 50, comment: 'old comment' });
        // snapshot taken before mutation -> previousScore keeps the old values
        expect(result.previousScore!.score).toBe(50);
      });

      it('does not change lastCheckerId when score changes but authorId is 0', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          lastCheckerId: 7,
          score: 50,
        } as TaskResult);

        await service.saveScoreWithStatus(10, 20, { authorId: 0, score: 80, comment: 'updated' });

        const [, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        expect(patch.lastCheckerId).toBe(7);
        expect(patch.score).toBe(80);
      });

      it('updates githubPrUrl only when a truthy url is provided', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          githubPrUrl: 'https://pr/old',
          score: 50,
          comment: 'old comment',
        } as TaskResult);

        await service.saveScoreWithStatus(10, 20, {
          score: 80,
          comment: 'updated',
          githubPrUrl: 'https://pr/new',
        });

        const [, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        expect(patch.githubPrUrl).toBe('https://pr/new');
      });

      it('keeps the existing githubPrUrl when no url is provided', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          githubPrUrl: 'https://pr/old',
          score: 50,
          comment: 'old comment',
        } as TaskResult);

        await service.saveScoreWithStatus(10, 20, { score: 80, comment: 'updated' });

        const [, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        expect(patch.githubPrUrl).toBe('https://pr/old');
      });

      it('does not append a historical record or change score when only the url changes', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          score: 50,
          comment: 'old comment',
          githubRepoUrl: 'https://repo',
          githubPrUrl: 'https://pr/old',
        } as TaskResult);

        const result = await service.saveScoreWithStatus(10, 20, {
          score: 50, // unchanged
          comment: 'old comment', // unchanged
          githubPrUrl: 'https://pr/new', // only change
        });

        const [, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        expect(patch.historicalScores).toHaveLength(0);
        expect(patch.score).toBe(50);
        expect(patch.githubPrUrl).toBe('https://pr/new');
        expect(result.previousScore).toBeUndefined();
      });

      it('keeps the existing comment when an empty comment is provided', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          comment: 'old comment',
          score: 50,
        } as TaskResult);

        await service.saveScoreWithStatus(10, 20, { score: 80, comment: '' });

        const [, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        // empty comment is falsy -> existing comment retained
        expect(patch.comment).toBe('old comment');
        // but score changed, so a historical record is still appended
        expect(patch.historicalScores).toHaveLength(1);
      });

      it('rounds the incoming score before comparing and persisting', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          score: 50,
          comment: 'old comment',
        } as TaskResult);

        await service.saveScoreWithStatus(10, 20, { score: 80.4, comment: 'updated' });

        const [, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        expect(patch.score).toBe(80);
      });

      it('trims comments longer than 8KiB before comparing/persisting', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          score: 50,
          comment: 'old comment',
        } as TaskResult);

        const longComment = 'x'.repeat(8 * 1024 + 100);
        await service.saveScoreWithStatus(10, 20, { score: 80, comment: longComment });

        const [, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        expect((patch.comment as string).length).toBe(8 * 1024);
      });

      it('treats a null comment input as empty (retains existing comment) but still updates score', async () => {
        taskResultRepository.findOne.mockResolvedValue({
          ...mockExistingResult,
          historicalScores: [],
          comment: 'old comment',
          score: 50,
        } as TaskResult);

        await service.saveScoreWithStatus(10, 20, {
          score: 80,
          comment: null as unknown as string,
        });

        const [, patch] = taskResultRepository.update.mock.calls[0] as [number, Partial<TaskResult>];
        expect(patch.comment).toBe('old comment');
        expect(patch.score).toBe(80);
      });
    });
  });

  describe('saveScore', () => {
    it('returns undefined previousScore on the create path', async () => {
      taskResultRepository.findOne.mockResolvedValue(null);
      taskResultRepository.save.mockResolvedValue({} as TaskResult);

      const result = await service.saveScore(10, 20, { score: 90, comment: 'great' });

      expect(result).toBeUndefined();
    });

    it('returns the previousScore snapshot on the update path', async () => {
      taskResultRepository.findOne.mockResolvedValue({
        ...mockExistingResult,
        historicalScores: [],
        score: 50,
        comment: 'old comment',
      } as TaskResult);
      taskResultRepository.update.mockResolvedValue({} as never);

      const result = await service.saveScore(10, 20, { score: 80, comment: 'updated' });

      expect(result).toMatchObject({ id: 555, score: 50 });
    });
  });
});
