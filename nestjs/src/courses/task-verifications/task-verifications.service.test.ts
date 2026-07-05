import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { Student } from '@entities/student';
import { TaskType } from '@entities/task';
import { TaskVerification } from '@entities/taskVerification';
import { TaskVerificationsService } from './task-verifications.service';
import { CloudApiService } from 'src/cloud-api/cloud-api.service';
import { SelfEducationService } from './self-education.service';

describe('TaskVerificationsService', () => {
  let service: TaskVerificationsService;

  const taskVerificationsRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const courseTasksRepository = {
    findOneByOrFail: vi.fn(),
    findOne: vi.fn(),
  };

  const studentsRepository = {
    findOneByOrFail: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const cloudService = {
    submitTask: vi.fn(),
  };

  const selfEducationService = {
    createSelfEducationVerification: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskVerificationsService,
        {
          provide: getRepositoryToken(TaskVerification),
          useValue: taskVerificationsRepository,
        },
        {
          provide: getRepositoryToken(CourseTask),
          useValue: courseTasksRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
        {
          provide: CloudApiService,
          useValue: cloudService,
        },
        {
          provide: SelfEducationService,
          useValue: selfEducationService,
        },
      ],
    }).compile();

    service = module.get<TaskVerificationsService>(TaskVerificationsService);
  });

  describe('getAnswersByAttempts', () => {
    const buildVerification = (
      overrides: Partial<{
        answers: { index: number; value: number | number[]; isCorrect: boolean }[];
        questions: unknown[];
        score: number;
        createdDate: Date;
      }> = {},
    ) => ({
      createdDate: overrides.createdDate ?? new Date('2026-01-05T00:00:00.000Z'),
      courseTaskId: 1,
      score: overrides.score ?? 80,
      answers: overrides.answers ?? [{ index: 0, value: 1, isCorrect: false }],
      courseTask: {
        maxScore: 100,
        task: {
          attributes: {
            public: {
              questions: overrides.questions ?? [
                {
                  question: 'Q1',
                  answers: ['a', 'b'],
                  multiple: false,
                  answersType: 'image',
                  questionImage: 'img.png',
                },
              ],
            },
          },
        },
      },
    });

    it('should throw if deadline has not passed yet', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({
        studentEndDate: new Date('2026-01-01T12:10:00.000Z'),
      });

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      await expect(service.getAnswersByAttempts(1, 2)).rejects.toThrow(BadRequestException);

      vi.useRealTimers();
    });

    it('should throw if there were no attempts (empty result)', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({ studentEndDate: null });
      taskVerificationsRepository.find.mockResolvedValueOnce([]);

      await expect(service.getAnswersByAttempts(1, 2)).rejects.toThrow(
        new BadRequestException('The answers cannot be checked if there were no attempts.'),
      );
    });

    it('should throw if attempts exist but none have answers', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({ studentEndDate: null });
      taskVerificationsRepository.find.mockResolvedValueOnce([
        buildVerification({ answers: [] }),
        // null/undefined answers should also count as "no answers"
        { ...buildVerification(), answers: undefined },
      ]);

      await expect(service.getAnswersByAttempts(1, 2)).rejects.toThrow(
        new BadRequestException('The answers are not available for this task.'),
      );
    });

    it('should not throw on deadline check when endDate is an invalid date', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({ studentEndDate: 'not-a-date' });
      taskVerificationsRepository.find.mockResolvedValueOnce([]);

      // Reaching the no-attempts branch proves the invalid-date check was skipped.
      await expect(service.getAnswersByAttempts(1, 2)).rejects.toThrow(
        new BadRequestException('The answers cannot be checked if there were no attempts.'),
      );
    });

    it('should not throw on deadline check when the deadline has already passed', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({
        studentEndDate: new Date('2026-01-01T00:00:00.000Z'),
      });
      taskVerificationsRepository.find.mockResolvedValueOnce([]);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'));

      await expect(service.getAnswersByAttempts(1, 2)).rejects.toThrow(
        new BadRequestException('The answers cannot be checked if there were no attempts.'),
      );

      vi.useRealTimers();
    });

    it('should map only incorrect answers into question DTOs', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({ studentEndDate: null });
      taskVerificationsRepository.find.mockResolvedValueOnce([
        buildVerification({
          score: 50,
          answers: [
            { index: 0, value: 1, isCorrect: false },
            { index: 1, value: 0, isCorrect: true },
          ],
          questions: [
            { question: 'Q1', answers: ['a', 'b'], multiple: false, answersType: 'image', questionImage: 'i.png' },
            { question: 'Q2', answers: ['c', 'd'], multiple: true },
          ],
        }),
      ]);

      const result = await service.getAnswersByAttempts(1, 2);

      expect(result).toHaveLength(1);
      expect(result[0].questions).toHaveLength(1);
      expect(result[0].questions[0]).toMatchObject({
        question: 'Q1',
        answers: ['a', 'b'],
        selectedAnswers: [1],
        multiple: false,
        answersType: 'image',
        questionImage: 'i.png',
      });
      expect(result[0].score).toBe(50);
      expect(result[0].maxScore).toBe(100);
    });

    it('should wrap a non-array incorrect answer value into an array of selected answers', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({ studentEndDate: null });
      taskVerificationsRepository.find.mockResolvedValueOnce([
        buildVerification({ answers: [{ index: 0, value: [1, 2], isCorrect: false }] }),
      ]);

      const result = await service.getAnswersByAttempts(1, 2);

      expect(result[0].questions[0].selectedAnswers).toEqual([1, 2]);
    });

    it('should drop incorrect answers whose question is missing from the task attributes', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({ studentEndDate: null });
      taskVerificationsRepository.find.mockResolvedValueOnce([
        buildVerification({
          answers: [{ index: 5, value: 1, isCorrect: false }],
          questions: [{ question: 'Q1', answers: ['a'], multiple: false }],
        }),
      ]);

      const result = await service.getAnswersByAttempts(1, 2);

      expect(result[0].questions).toHaveLength(0);
    });
  });

  describe('createTaskVerification', () => {
    const student = { id: 10, courseId: 20 } as Student;

    it('should throw BadRequest when the course task is not found', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce(null);
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);

      await expect(service.createTaskVerification(11, 10, { githubId: 'gh', body: {} })).rejects.toThrow(
        new BadRequestException('No student or not valid course task'),
      );
    });

    it('should throw BadRequest when the course task does not belong to the student course', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 999,
        task: { name: 'Task' },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);

      await expect(service.createTaskVerification(11, 10, { githubId: 'gh', body: {} })).rejects.toThrow(
        new BadRequestException(`Course task does not belong to the student's course`),
      );
    });

    it('should throw BadRequest when the task has not started yet', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        studentStartDate: new Date('2026-01-01T18:00:00.000Z'),
        task: { name: 'Future Task' },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      await expect(service.createTaskVerification(11, 10, { githubId: 'gh', body: {} })).rejects.toThrow(
        new BadRequestException('Task Verification Future Task not started'),
      );

      vi.useRealTimers();
    });

    it('should throw Too Many Requests when pending verification exists', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        studentStartDate: new Date('2026-01-01T08:00:00.000Z'),
        studentEndDate: new Date('2026-01-01T18:00:00.000Z'),
        task: { name: 'Task' },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);
      taskVerificationsRepository.findOne.mockResolvedValueOnce({ id: 77 });

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      await expect(service.createTaskVerification(11, 10, { githubId: 'gh', body: {} })).rejects.toMatchObject({
        status: HttpStatus.TOO_MANY_REQUESTS,
      });

      vi.useRealTimers();
    });

    it('should throw when task verification is expired', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        studentStartDate: new Date('2026-01-01T08:00:00.000Z'),
        studentEndDate: new Date('2026-01-01T11:00:00.000Z'),
        task: { name: 'Task' },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);
      taskVerificationsRepository.findOne.mockResolvedValueOnce(null);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      await expect(service.createTaskVerification(11, 10, { githubId: 'gh', body: {} })).rejects.toThrow('expired');

      vi.useRealTimers();
    });

    it('should delegate self-education tasks to self-education service', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        type: TaskType.SelfEducation,
        studentStartDate: new Date('2026-01-01T08:00:00.000Z'),
        studentEndDate: new Date('2026-01-01T18:00:00.000Z'),
        task: { name: 'Task', type: TaskType.SelfEducation },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);
      taskVerificationsRepository.findOne.mockResolvedValueOnce(null);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      const result = await service.createTaskVerification(11, 10, {
        githubId: 'gh',
        body: [{ index: 0, value: 1 }],
      });

      expect(result).toEqual({ id: undefined });
      expect(selfEducationService.createSelfEducationVerification).toHaveBeenCalledTimes(1);
      expect(taskVerificationsRepository.save).not.toHaveBeenCalled();
      expect(cloudService.submitTask).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should persist a pending verification and submit it to the cloud for non-self-education tasks', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        type: TaskType.JSTask,
        studentStartDate: new Date('2026-01-01T08:00:00.000Z'),
        studentEndDate: new Date('2026-01-01T18:00:00.000Z'),
        task: { name: 'JS Task', type: TaskType.JSTask, attributes: { foo: 'bar' } },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);
      taskVerificationsRepository.findOne.mockResolvedValueOnce(null);
      taskVerificationsRepository.save.mockResolvedValueOnce({ id: 555 });

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      const result = await service.createTaskVerification(11, 10, {
        githubId: 'gh-user',
        body: { repo: 'my-repo' },
      });

      expect(taskVerificationsRepository.save).toHaveBeenCalledWith({
        studentId: 10,
        courseTaskId: 11,
        score: 0,
        status: 'pending',
      });
      expect(cloudService.submitTask).toHaveBeenCalledWith([
        {
          id: 555,
          githubId: 'gh-user',
          studentId: 10,
          courseTask: {
            repo: 'my-repo',
            id: 11,
            type: TaskType.JSTask,
            attributes: { foo: 'bar' },
          },
        },
      ]);
      expect(result).toEqual({ id: 555 });

      vi.useRealTimers();
    });

    it('should fall back to task.type and empty attributes when the course task fields are absent', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        type: null,
        studentStartDate: null,
        studentEndDate: null,
        task: { name: 'JS Task', type: TaskType.JSTask, attributes: null },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);
      taskVerificationsRepository.findOne.mockResolvedValueOnce(null);
      taskVerificationsRepository.save.mockResolvedValueOnce({ id: 556 });

      const result = await service.createTaskVerification(11, 10, { githubId: 'gh', body: {} });

      expect(cloudService.submitTask).toHaveBeenCalledWith([
        {
          id: 556,
          githubId: 'gh',
          studentId: 10,
          courseTask: {
            id: 11,
            type: TaskType.JSTask,
            attributes: {},
          },
        },
      ]);
      expect(result).toEqual({ id: 556 });
    });
  });

  describe('getStudentVerifications', () => {
    function qb(terminal: Record<string, unknown>) {
      const builder: Record<string, unknown> = {};
      for (const method of ['innerJoin', 'addSelect', 'where', 'andWhere', 'orderBy']) {
        builder[method] = vi.fn(() => builder);
      }
      return Object.assign(builder, terminal);
    }

    const CREATED = new Date('2024-01-01T00:00:00.000Z');
    function verification(overrides: Record<string, unknown> = {}) {
      return {
        id: 1,
        createdDate: CREATED,
        updatedDate: new Date('2024-01-02T00:00:00.000Z'),
        studentId: 7,
        courseTaskId: 100,
        courseTask: { id: 100, type: 'jstask', task: { name: 'Task A' } },
        details: 'ok',
        status: 'completed',
        score: 80,
        metadata: [],
        ...overrides,
      };
    }
    const dto = (overrides: Record<string, unknown> = {}) => ({
      id: 1,
      createdDate: CREATED,
      studentId: 7,
      courseTaskId: 100,
      courseTask: { id: 100, type: 'jstask', task: { name: 'Task A' } },
      details: 'ok',
      status: 'completed',
      score: 80,
      metadata: [],
      ...overrides,
    });

    it('returns null when the student is not found in the course', async () => {
      studentsRepository.createQueryBuilder.mockReturnValue(qb({ getOne: vi.fn().mockResolvedValue(null) }));

      const result = await service.getStudentVerifications(13, 'ghost');

      expect(result).toBeNull();
    });

    it('groups verifications by courseTaskId and exposes only the documented DTO fields', async () => {
      studentsRepository.createQueryBuilder.mockReturnValue(qb({ getOne: vi.fn().mockResolvedValue({ id: 7 }) }));
      taskVerificationsRepository.createQueryBuilder.mockReturnValue(
        qb({
          getMany: vi.fn().mockResolvedValue([
            verification({ id: 1, courseTaskId: 100, score: 80 }),
            verification({
              id: 2,
              courseTaskId: 200,
              score: 50,
              courseTask: { id: 200, type: 'cv:markdown', task: { name: 'Task B' } },
            }),
            verification({ id: 3, courseTaskId: 100, score: 90 }),
          ]),
        }),
      );

      const result = await service.getStudentVerifications(13, 'alreadybored');

      expect(result).toEqual([
        {
          courseTaskId: 100,
          verifications: [dto({ id: 1, score: 80 }), dto({ id: 3, score: 90 })],
        },
        {
          courseTaskId: 200,
          verifications: [
            dto({
              id: 2,
              courseTaskId: 200,
              score: 50,
              courseTask: { id: 200, type: 'cv:markdown', task: { name: 'Task B' } },
            }),
          ],
        },
      ]);
      // entity internals (e.g. updatedDate) must not leak into the documented response
      expect(result![0]!.verifications[0]).not.toHaveProperty('updatedDate');
    });

    it('surfaces null details and null course-task type instead of dropping them', async () => {
      studentsRepository.createQueryBuilder.mockReturnValue(qb({ getOne: vi.fn().mockResolvedValue({ id: 7 }) }));
      taskVerificationsRepository.createQueryBuilder.mockReturnValue(
        qb({
          getMany: vi
            .fn()
            .mockResolvedValue([
              verification({ details: null, courseTask: { id: 100, type: null, task: { name: 'Task A' } } }),
            ]),
        }),
      );

      const result = await service.getStudentVerifications(13, 'alreadybored');

      expect(result![0]!.verifications[0]!.details).toBeNull();
      expect(result![0]!.verifications[0]!.courseTask.type).toBeNull();
    });
  });
});
