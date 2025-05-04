import { CourseTask } from '@entities/courseTask';
import { Task, TaskType } from '@entities/task';
import { TaskVerification } from '@entities/taskVerification';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { WriteScoreService } from '../score';
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
        answers: attributes.answers,
      },
    } as unknown as Task,
  } as unknown as CourseTask;
};

describe('SelfEducationService', () => {
  let service: SelfEducationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelfEducationService,
        {
          provide: getRepositoryToken(TaskVerification),
          useValue: {},
        },
        {
          provide: WriteScoreService,
          useValue: {},
        },
      ],
    }).compile();
    service = module.get<SelfEducationService>(SelfEducationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      it('should throw if answer count !== numberOfQuestions (less)', () => {
        studentAnswers = [{ index: 0, value: 0 }];

        mockTask = createMockCourseTask({
          public: { numberOfQuestions: 2 },
          answers: [0, 1],
        });

        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Number of submitted answers (1) does not match the number of questions (2)'),
        );
      });

      it('should throw if answer count !== numberOfQuestions (more)', () => {
        studentAnswers = [
          { index: 0, value: 0 },
          { index: 1, value: 1 },
          { index: 2, value: 2 },
        ];
        mockTask = createMockCourseTask({ public: { numberOfQuestions: 2 } });
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Number of submitted answers (3) does not match the number of questions (2)'),
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

      it('should throw  if input value is undefined', () => {
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
    });

    describe('Time-Based Attempt Restrictions', () => {
      const hoursRestriction = 2;
      const attempt = 1;

      beforeEach(() => {
        mockTask = createMockCourseTask({
          public: { oneAttemptPerNumberOfHours: hoursRestriction, strictAttemptsMode: true, maxAttemptsNumber: 5 },
          answers: [0, [1, 2]],
        });
      });

      it('should throw ForbiddenException if last attempt was less than required hours ago', () => {
        const lastAttemptTime = dayjs()
          .subtract(hoursRestriction - 1, 'hour')
          .toISOString();
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, lastAttemptTime)).toThrow(
          ForbiddenException,
        );
      });

      it('should NOT throw if last attempt was exactly required hours ago', () => {
        const mockDiff = jest.fn().mockReturnValue(hoursRestriction);
        jest.spyOn(dayjs.prototype, 'diff').mockImplementation(mockDiff);
        const lastAttemptTime = dayjs().subtract(hoursRestriction, 'hour').toISOString();

        expect(() =>
          service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, lastAttemptTime),
        ).not.toThrow(ForbiddenException);
        expect(mockDiff).toHaveBeenCalledWith(lastAttemptTime, 'hours');
      });

      it('should NOT throw if last attempt was more than required hours ago', () => {
        const mockDiff = jest.fn().mockReturnValue(hoursRestriction + 1);
        jest.spyOn(dayjs.prototype, 'diff').mockImplementation(mockDiff);
        const lastAttemptTime = dayjs()
          .subtract(hoursRestriction + 1, 'hour')
          .toISOString();

        expect(() =>
          service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, lastAttemptTime),
        ).not.toThrow(ForbiddenException);
        expect(mockDiff).toHaveBeenCalledWith(lastAttemptTime, 'hours');
      });

      it('should NOT throw if lastAttemptTime is undefined', () => {
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, undefined)).not.toThrow(
          ForbiddenException,
        );
      });

      it('should NOT throw if oneAttemptPerNumberOfHours is 0', () => {
        mockTask = createMockCourseTask({ public: { oneAttemptPerNumberOfHours: 0 } });
        const lastAttemptTime = dayjs().subtract(1, 'minute').toISOString();
        expect(() =>
          service.verifySelfEducationAnswers(mockTask, studentAnswers, attempt, lastAttemptTime),
        ).not.toThrow(ForbiddenException);
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
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, maxAttempts - 1)).not.toThrow(
          ForbiddenException,
        );
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
        expect(result.studentCorrectAnswers).toEqual([
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
        expect(result.studentCorrectAnswers).toEqual([
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
        expect(result.studentCorrectAnswers).toEqual([
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
        expect(result.studentCorrectAnswers).toEqual([
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
        expect(result.studentCorrectAnswers).toEqual([
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
        expect(result.studentCorrectAnswers).toEqual([
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

        expect(result).toHaveProperty('studentCorrectAnswers');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('details');

        expect(Array.isArray(result.studentCorrectAnswers)).toBe(true);
        expect(result.studentCorrectAnswers.length).toBe(2);
        expect(result.studentCorrectAnswers[0]).toEqual({ index: 0, value: 0, isCorrect: true });
        expect(result.studentCorrectAnswers[1]).toEqual({ index: 1, value: 99, isCorrect: false });

        expect(typeof result.score).toBe('number');
        expect(result.score).toBe(50);

        expect(typeof result.details).toBe('string');
        expect(result.details).toBe('Accuracy: 50%');
      });
    });

    describe('Edge Cases', () => {
      it('should throw if indices are not sequential from 0', () => {
        studentAnswers = [
          { index: 1, value: 0 },
          { index: 2, value: 1 },
        ];
        mockTask = createMockCourseTask({ public: { numberOfQuestions: 2 } });
        expect(() => service.verifySelfEducationAnswers(mockTask, studentAnswers, 0)).toThrow(
          new BadRequestException('Missing answer for question index 0'),
        );
      });

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
        expect(result.studentCorrectAnswers[1]?.isCorrect).toBe(true);
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
        expect(result.studentCorrectAnswers.every(a => a.isCorrect)).toBe(true);
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
