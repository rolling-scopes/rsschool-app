import type { Mocked } from 'vitest';
import { CourseTask } from '@entities/courseTask';
import { Task, TaskType } from '@entities/task';
import { TaskVerification } from '@entities/taskVerification';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WriteScoreService } from '../score/write-score.service';
import { SelfEducationAnswers } from './dto';
import { SelfEducationAttributes, SelfEducationService } from './self-education.service';

const createMockCourseTask = (
  attributes: { public: Partial<SelfEducationAttributes['public']>; answers?: SelfEducationAttributes['answers'] },
  maxScore: number = 100,
): CourseTask => {
  return {
    id: 1,
    courseId: 1,
    maxScore,
    task: {
      id: 1,
      type: TaskType.SelfEducation,
      attributes: {
        public: {
          numberOfQuestions: 2,
          ...attributes.public,
        },
        answers: attributes.answers ?? [0, 1],
      },
    } as unknown as Task,
  } as unknown as CourseTask;
};

describe('SelfEducationService', () => {
  let service: SelfEducationService;
  let taskVerificationsRepository: Mocked<Repository<TaskVerification>>;
  let writeScoreService: Mocked<WriteScoreService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelfEducationService,
        {
          provide: getRepositoryToken(TaskVerification),
          useValue: {
            find: vi.fn(),
            save: vi.fn(),
            findOneByOrFail: vi.fn(),
          },
        },
        {
          provide: WriteScoreService,
          useValue: {
            saveScore: vi.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<SelfEducationService>(SelfEducationService);
    taskVerificationsRepository = module.get(getRepositoryToken(TaskVerification));
    writeScoreService = module.get(WriteScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSelfEducationVerification', () => {
    let mockTask: CourseTask;
    let studentAnswers: SelfEducationAnswers;

    beforeEach(() => {
      mockTask = createMockCourseTask({
        public: {
          numberOfQuestions: 2,
          tresholdPercentage: 50,
          maxAttemptsNumber: 5,
          strictAttemptsMode: true,
          oneAttemptPerNumberOfHours: 0,
        },
        answers: [0, 1],
      });
      studentAnswers = [
        { index: 0, value: 0 },
        { index: 1, value: 1 },
      ];
    });

    it('should verify answers, persist a completed verification and write the score', async () => {
      taskVerificationsRepository.find.mockResolvedValue([]);
      taskVerificationsRepository.save.mockResolvedValue({ id: 99 } as TaskVerification);
      const savedRecord = { id: 99, score: 100, status: 'completed' } as TaskVerification;
      taskVerificationsRepository.findOneByOrFail.mockResolvedValue(savedRecord);

      const result = await service.createSelfEducationVerification({
        courseId: 1,
        courseTask: mockTask,
        studentId: 7,
        studentAnswers,
      });

      expect(taskVerificationsRepository.find).toHaveBeenCalledWith({
        where: { studentId: 7, courseTaskId: mockTask.id },
        order: { createdDate: 'DESC' },
      });
      expect(taskVerificationsRepository.save).toHaveBeenCalledWith({
        studentId: 7,
        courseTaskId: mockTask.id,
        score: 100,
        details: 'Accuracy: 100%',
        status: 'completed',
        answers: [
          { index: 0, value: 0, isCorrect: true },
          { index: 1, value: 1, isCorrect: true },
        ],
      });
      expect(taskVerificationsRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 99 });
      expect(writeScoreService.saveScore).toHaveBeenCalledWith(7, mockTask.id, {
        score: 100,
        comment: 'Accuracy: 100%',
      });
      expect(result).toEqual({ ...savedRecord, courseTask: { type: mockTask.type } });
    });

    it('should pass the previous attempt count and last attempt time into verification', async () => {
      const lastDate = new Date('2026-01-01T10:00:00.000Z');
      taskVerificationsRepository.find.mockResolvedValue([
        { createdDate: lastDate } as TaskVerification,
        {} as TaskVerification,
      ]);
      taskVerificationsRepository.save.mockResolvedValue({ id: 5 } as TaskVerification);
      taskVerificationsRepository.findOneByOrFail.mockResolvedValue({ id: 5 } as TaskVerification);
      const verifySpy = vi.spyOn(service, 'verifySelfEducationAnswers');

      await service.createSelfEducationVerification({
        courseId: 1,
        courseTask: mockTask,
        studentId: 7,
        studentAnswers,
      });

      expect(verifySpy).toHaveBeenCalledWith(mockTask, studentAnswers, 2, lastDate.toString());
    });

    it('should pass undefined last attempt time when there are no previous verifications', async () => {
      taskVerificationsRepository.find.mockResolvedValue([]);
      taskVerificationsRepository.save.mockResolvedValue({ id: 5 } as TaskVerification);
      taskVerificationsRepository.findOneByOrFail.mockResolvedValue({ id: 5 } as TaskVerification);
      const verifySpy = vi.spyOn(service, 'verifySelfEducationAnswers');

      await service.createSelfEducationVerification({
        courseId: 1,
        courseTask: mockTask,
        studentId: 7,
        studentAnswers,
      });

      expect(verifySpy).toHaveBeenCalledWith(mockTask, studentAnswers, 0, undefined);
    });

    it('should not persist or write a score when verification throws (e.g. attempts exceeded)', async () => {
      taskVerificationsRepository.find.mockResolvedValue(
        Array.from({ length: 5 }, () => ({ createdDate: new Date() }) as TaskVerification),
      );

      await expect(
        service.createSelfEducationVerification({
          courseId: 1,
          courseTask: mockTask,
          studentId: 7,
          studentAnswers,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(taskVerificationsRepository.save).not.toHaveBeenCalled();
      expect(writeScoreService.saveScore).not.toHaveBeenCalled();
    });
  });

  describe('verifySelfEducationAnswers', () => {
    let mockTask: CourseTask;
    let studentAnswers: SelfEducationAnswers;

    beforeEach(() => {
      mockTask = createMockCourseTask({
        public: { numberOfQuestions: 2 },
        answers: [0, [1, 2]],
      });
      studentAnswers = [
        { index: 0, value: 0 },
        { index: 1, value: [1, 2] },
      ];
    });

    describe('Input Validation', () => {
      it('should throw if student answers count greater than total answers', () => {
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 1, value: 1 },
          { index: 2, value: 2 },
        ];

        mockTask = createMockCourseTask({
          public: {},
          answers: [0, 1],
        });

        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Incorrect student answers count'),
        );
      });

      it('should throw if student answers count is 0', () => {
        studentAnswers = [];

        mockTask = createMockCourseTask({
          public: {},
          answers: [0, 1],
        });

        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Incorrect student answers count'),
        );
      });

      it('should throw if indices are not unique', () => {
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 0, value: 1 },
        ];
        mockTask = createMockCourseTask({ public: { numberOfQuestions: 2 } });
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Submitted answer indices must be unique'),
        );
      });

      it('should throw if input value is undefined', () => {
        studentAnswers = [
          // @ts-expect-error - test
          { index: 0, value: undefined },
          { index: 1, value: 1 },
        ];
        mockTask = createMockCourseTask({ public: { numberOfQuestions: 2 } });
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Invalid answer value'),
        );
      });

      it('should throw if input value is NaN', () => {
        studentAnswers = [
          { index: 0, value: NaN },
          { index: 1, value: 1 },
        ];
        mockTask = createMockCourseTask({ public: { numberOfQuestions: 2 } });
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Invalid answer value'),
        );
      });

      it('should throw if index is out of range', () => {
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 2, value: 1 },
        ];
        mockTask = createMockCourseTask({ public: {} });
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Invalid answer index'),
        );
      });

      it('should throw if index is negative', () => {
        studentAnswers = [
          { index: -1, value: 0 },
          { index: 1, value: 1 },
        ];
        mockTask = createMockCourseTask({ public: {} });
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Invalid answer index'),
        );
      });

      it('should throw if value is negative', () => {
        studentAnswers = [
          { index: 0, value: -1 },
          { index: 1, value: 1 },
        ];
        mockTask = createMockCourseTask({ public: {} });
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Invalid answer value'),
        );
      });
    });

    describe('Time-Based Attempt Restrictions', () => {
      const hoursRestriction = 2;
      const attempt = 1;
      const fixedNow = new Date('2026-01-01T12:00:00.000Z');

      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(fixedNow);
        mockTask = createMockCourseTask({
          public: { oneAttemptPerNumberOfHours: hoursRestriction, strictAttemptsMode: true, maxAttemptsNumber: 5 },
          answers: [0, [1, 2]],
        });
      });
      afterEach(() => {
        vi.useRealTimers();
      });

      it('should throw ForbiddenException if last attempt was less than required hours ago', () => {
        const lastAttemptTime = new Date(fixedNow.getTime() - (hoursRestriction - 1) * 60 * 60 * 1000).toISOString();
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, lastAttemptTime)).toThrow(
          ForbiddenException,
        );
      });

      it('should NOT throw if last attempt was exactly required hours ago', () => {
        const lastAttemptTime = new Date(fixedNow.getTime() - hoursRestriction * 60 * 60 * 1000).toISOString();

        expect(() =>
          service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, lastAttemptTime),
        ).not.toThrow();
      });

      it('should NOT throw if last attempt was more than required hours ago', () => {
        const lastAttemptTime = new Date(fixedNow.getTime() - (hoursRestriction + 1) * 60 * 60 * 1000).toISOString();

        expect(() =>
          service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, lastAttemptTime),
        ).not.toThrow();
      });

      it('should NOT throw if lastAttemptTime is undefined', () => {
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, undefined)).not.toThrow();
      });

      it('should NOT throw if oneAttemptPerNumberOfHours is 0', () => {
        mockTask = createMockCourseTask({ public: { oneAttemptPerNumberOfHours: 0 } });
        const lastAttemptTime = new Date(fixedNow.getTime() - 60 * 1000).toISOString();
        expect(() =>
          service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, lastAttemptTime),
        ).not.toThrow();
      });
    });

    describe('Count-Based Attempt Restrictions (Strict Mode)', () => {
      const maxAttempts = 3;
      beforeEach(() => {
        mockTask = createMockCourseTask({
          public: { maxAttemptsNumber: 3, strictAttemptsMode: true, oneAttemptPerNumberOfHours: 0 },
        });
      });

      it('should NOT throw if attempt < maxAttemptsNumber', () => {
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, maxAttempts - 1)).not.toThrow();
      });

      it('should throw ForbiddenException if attempt >= maxAttemptsNumber', () => {
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, maxAttempts)).toThrow(
          ForbiddenException,
        );
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, maxAttempts + 1)).toThrow(
          ForbiddenException,
        );
      });
    });

    describe('Count-Based Attempt Restrictions (Non-Strict Mode)', () => {
      const maxAttempts = 3;
      const maxScore = 100;
      const threshold = 50;

      beforeEach(() => {
        mockTask = createMockCourseTask(
          {
            public: {
              numberOfQuestions: 10,
              maxAttemptsNumber: maxAttempts,
              strictAttemptsMode: false,
              oneAttemptPerNumberOfHours: 0,
              tresholdPercentage: threshold,
            },
            answers: Array.from({ length: 10 }, (_, i) => i),
          },
          maxScore,
        );
        studentAnswers = Array.from({ length: 10 }, (_, i) => ({
          index: i,
          value: i < 8 ? i : 99,
        }));
      });

      it('should not halve score if attempt < maxAttemptsNumber', () => {
        const attempt = maxAttempts - 1;
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt);
        expect(result.score).toBe(80);
        expect(result.details).toBe('Accuracy: 80%');
      });

      it('should halve score and add note if attempt === maxAttemptsNumber', () => {
        const attempt = maxAttempts;
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt);
        expect(result.score).toBe(40);
        expect(result.details).toBe('Accuracy: 80%. Attempts number was over, so score was divided by 2');
      });

      it('should halve score and add note if attempt > maxAttemptsNumber', () => {
        const attempt = maxAttempts + 1;
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt);
        expect(result.score).toBe(40);
        expect(result.details).toBe('Accuracy: 80%. Attempts number was over, so score was divided by 2');
      });

      it('should halve score AFTER checking threshold (score 0 remains 0)', () => {
        mockTask = createMockCourseTask(
          {
            public: {
              numberOfQuestions: 10,
              maxAttemptsNumber: maxAttempts,
              strictAttemptsMode: false,
              oneAttemptPerNumberOfHours: 0,
              tresholdPercentage: 50,
            },
            answers: Array.from({ length: 10 }, (_, i) => i),
          },
          maxScore,
        );
        studentAnswers = Array.from({ length: 10 }, (_, i) => ({
          index: i,
          value: i < 4 ? i : 99,
        }));
        const attempt = maxAttempts;
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt);
        expect(result.score).toBe(0);
        expect(result.details).toContain(
          'Your accuracy: 40%. The minimum accuracy for obtaining a score on this test is 50%.',
        );
        expect(result.details).toContain('. Attempts number was over, so score was divided by 2');
      });
    });

    describe('Answer Verification & Score Calculation', () => {
      const threshold = 60;
      const maxScore = 100;
      const numQuestions = 10;

      beforeEach(() => {
        mockTask = createMockCourseTask(
          {
            public: {
              numberOfQuestions: numQuestions,
              tresholdPercentage: threshold,
              strictAttemptsMode: true,
              maxAttemptsNumber: 5,
            },
            answers: Array.from({ length: numQuestions }, (_, i) => i),
          },
          maxScore,
        );
      });

      it('should score 0 if accuracy < threshold', () => {
        studentAnswers = Array.from({ length: numQuestions }, (_, i) => ({
          index: i,
          value: i < 5 ? i : 99,
        }));
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(0);
        expect(result.details).toBe(
          `Your accuracy: 50%. The minimum accuracy for obtaining a score on this test is ${threshold}%.`,
        );
      });

      it('should calculate score correctly if accuracy === threshold', () => {
        studentAnswers = Array.from({ length: numQuestions }, (_, i) => ({
          index: i,
          value: i < 6 ? i : 99,
        }));
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(60);
        expect(result.details).toBe(`Accuracy: 60%`);
      });

      it('should calculate score correctly if accuracy > threshold', () => {
        studentAnswers = Array.from({ length: numQuestions }, (_, i) => ({
          index: i,
          value: i,
        }));
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(100);
        expect(result.details).toBe(`Accuracy: 100%`);
      });

      it('should score 0 if accuracy is 0%', () => {
        studentAnswers = Array.from({ length: numQuestions }, (_, i) => ({
          index: i,
          value: 99,
        }));
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(0);
        expect(result.details).toBe(
          `Your accuracy: 0%. The minimum accuracy for obtaining a score on this test is ${threshold}%.`,
        );
      });

      it('should calculate score based on maxScore', () => {
        const specificMaxScore = 95;
        mockTask = createMockCourseTask(
          {
            public: { numberOfQuestions: numQuestions, tresholdPercentage: threshold },
            answers: Array.from({ length: numQuestions }, (_, i) => i),
          },
          specificMaxScore,
        );
        studentAnswers = Array.from({ length: numQuestions }, (_, i) => ({
          index: i,
          value: i < 8 ? i : 99,
        }));
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        const expectedScore = Math.floor(specificMaxScore * 0.8);
        expect(result.score).toBe(expectedScore);
        expect(result.details).toBe(`Accuracy: 80%`);
      });
    });

    describe('Answer Verification (Single/Multiple Choice & Order)', () => {
      beforeEach(() => {
        mockTask = createMockCourseTask({
          public: { numberOfQuestions: 2 },
          answers: [5, [1, 3]],
        });
      });

      it('should mark correct for exact match (single and multiple)', () => {
        studentAnswers = [
          { index: 0, value: 5 },
          { index: 1, value: [1, 3] },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.checkedAnswers).toEqual([
          { index: 0, value: 5, isCorrect: true },
          { index: 1, value: [1, 3], isCorrect: true },
        ]);
        expect(result.score).toBe(100);
      });

      it('should mark correct for multiple choice regardless of order', () => {
        studentAnswers = [
          { index: 0, value: 5 },
          { index: 1, value: [3, 1] },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.checkedAnswers).toEqual([
          { index: 0, value: 5, isCorrect: true },
          { index: 1, value: [3, 1], isCorrect: true },
        ]);
        expect(result.score).toBe(100);
      });

      it('should mark incorrect for wrong single answer', () => {
        studentAnswers = [
          { index: 0, value: 4 },
          { index: 1, value: [1, 3] },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.checkedAnswers).toEqual([
          { index: 0, value: 4, isCorrect: false },
          { index: 1, value: [1, 3], isCorrect: true },
        ]);
        expect(result.score).toBe(50);
      });

      it('should mark incorrect for wrong multiple choice answer (partial match)', () => {
        studentAnswers = [
          { index: 0, value: 5 },
          { index: 1, value: [1] },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.checkedAnswers).toEqual([
          { index: 0, value: 5, isCorrect: true },
          { index: 1, value: [1], isCorrect: false },
        ]);
        expect(result.score).toBe(50);
      });

      it('should mark incorrect for wrong multiple choice answer (extra value)', () => {
        studentAnswers = [
          { index: 0, value: 5 },
          { index: 1, value: [1, 3, 4] },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.checkedAnswers).toEqual([
          { index: 0, value: 5, isCorrect: true },
          { index: 1, value: [1, 3, 4], isCorrect: false },
        ]);
        expect(result.score).toBe(50);
      });

      it('should handle single answers provided as array', () => {
        studentAnswers = [
          { index: 0, value: [5] },
          { index: 1, value: [1, 3] },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.checkedAnswers).toEqual([
          { index: 0, value: [5], isCorrect: true },
          { index: 1, value: [1, 3], isCorrect: true },
        ]);
        expect(result.score).toBe(100);
      });
    });

    describe('Return Value Structure', () => {
      it('should return the expected structure', () => {
        mockTask = createMockCourseTask({
          public: { numberOfQuestions: 2, tresholdPercentage: 0 },
          answers: [0, 1],
        });
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 1, value: 99 },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);

        expect(result).toHaveProperty('checkedAnswers');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('details');

        expect(Array.isArray(result.checkedAnswers)).toBe(true);
        expect(result.checkedAnswers.length).toBe(2);
        expect(result.checkedAnswers[0]).toEqual({ index: 0, value: 0, isCorrect: true });
        expect(result.checkedAnswers[1]).toEqual({ index: 1, value: 99, isCorrect: false });

        expect(typeof result.score).toBe('number');
        expect(result.score).toBe(50);

        expect(typeof result.details).toBe('string');
        expect(result.details).toBe('Accuracy: 50%');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty array as answer value', () => {
        mockTask = createMockCourseTask({
          public: { numberOfQuestions: 2 },
          answers: [0, []],
        });
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 1, value: [] },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.checkedAnswers[1]?.isCorrect).toBe(true);
      });

      it('should handle 0% threshold correctly', () => {
        mockTask = createMockCourseTask({
          public: { numberOfQuestions: 2, tresholdPercentage: 0 },
          answers: [0, 1],
        });
        studentAnswers = [
          { index: 0, value: 99 },
          { index: 1, value: 99 },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(0);
        expect(result.details).toBe('Accuracy: 0%');
      });

      it('should handle 100% threshold correctly', () => {
        mockTask = createMockCourseTask({
          public: { numberOfQuestions: 2, tresholdPercentage: 100 },
          answers: [0, 1],
        });

        // All correct - should pass
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 1, value: 1 },
        ];
        let result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(100);

        // One wrong - should fail
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 1, value: 99 },
        ];
        result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(0);
        expect(result.details).toBe(
          'Your accuracy: 50%. The minimum accuracy for obtaining a score on this test is 100%.',
        );
      });

      it('should handle mixed single and multiple choice answers correctly', () => {
        mockTask = createMockCourseTask({
          public: { numberOfQuestions: 3 },
          answers: [5, [1, 3], 7],
        });
        studentAnswers = [
          { index: 0, value: 5 },
          { index: 1, value: [1, 3] },
          { index: 2, value: 7 },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(100);
        expect(result.checkedAnswers.every(a => a.isCorrect)).toBe(true);
      });

      it('should round scores correctly', () => {
        mockTask = createMockCourseTask(
          {
            public: { numberOfQuestions: 3, tresholdPercentage: 0 },
            answers: [0, 1, 2],
          },
          100,
        );

        // 2/3 correct = 66.67% rounded to 67%
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 1, value: 1 },
          { index: 2, value: 99 },
        ];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(67); // Should be rounded correctly - 66.67% of 100 = 66.67 -> floor -> 66
        expect(result.details).toBe('Accuracy: 67%');
      });

      it('should handle maxScore of 0', () => {
        mockTask = createMockCourseTask(
          {
            public: { numberOfQuestions: 1, tresholdPercentage: 0 },
            answers: [1],
          },
          0,
        );
        studentAnswers = [{ index: 0, value: 1 }];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, 0);
        expect(result.score).toBe(0);
        expect(result.details).toBe('Accuracy: 100%');
      });

      it('should throw if the answer slot is a hole in a sparse answers array (within range)', () => {
        // A sparse array passes the `index < answers.length` range check but
        // `answers[index]` is `undefined`, exercising the inner guard.
        const sparseAnswers: SelfEducationAttributes['answers'] = [0, 1];
        delete sparseAnswers[1];
        mockTask = createMockCourseTask({
          public: { numberOfQuestions: 2 },
          answers: sparseAnswers,
        });
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 1, value: 1 },
        ];
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Invalid answer index'),
        );
      });

      it('should handle extremely large attempt numbers correctly in non-strict mode', () => {
        mockTask = createMockCourseTask(
          {
            public: {
              numberOfQuestions: 1,
              tresholdPercentage: 0,
              maxAttemptsNumber: 3,
              strictAttemptsMode: false,
            },
            answers: [1],
          },
          100,
        );

        studentAnswers = [{ index: 0, value: 1 }];
        const result = service.verifySelfEducationAnswers(mockTask, studentAnswers, Number.MAX_SAFE_INTEGER);
        expect(result.score).toBe(50); // Still just divided by 2 once
        expect(result.details).toBe('Accuracy: 100%. Attempts number was over, so score was divided by 2');
      });
    });
  });
});
