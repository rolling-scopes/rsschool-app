import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Mocked } from 'vitest';
import { TaskSolutionChecker } from '@entities/taskSolutionChecker';
import { CourseCrossCheckService, OrderDirection, OrderField } from './course-cross-checks.service';
import { TaskSolution } from '@entities/taskSolution';
import { CrossCheckMessageAuthorRole, TaskSolutionResult } from '@entities/taskSolutionResult';
import { CourseTask, CrossCheckStatus } from '@entities/courseTask';
import { DataSource } from 'typeorm';
import { Student } from '@entities/student';
import { User } from '@entities/user';
import { WriteScoreService } from '../score/write-score.service';
import { CrossCheckDistributionService } from './cross-check-distribution';

// ---------------------------------------------------------------------------
// Shared fluent QueryBuilder helper: every chained method returns qb, terminal
// methods (getOne/getMany/getRawMany/getCount) resolve the configured rows.
// ---------------------------------------------------------------------------
type Terminal = 'getOne' | 'getMany' | 'getRawMany' | 'getCount';

function makeQb(terminals: Partial<Record<Terminal, unknown>> = {}) {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  const chainable = [
    'select',
    'addSelect',
    'from',
    'leftJoin',
    'leftJoinAndSelect',
    'innerJoin',
    'innerJoinAndSelect',
    'where',
    'andWhere',
    'having',
    'groupBy',
    'orderBy',
    'addOrderBy',
    'limit',
    'offset',
    'subQuery',
    'getQuery',
  ];
  for (const m of chainable) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getQuery = vi.fn(() => '(subquery)');
  for (const [name, value] of Object.entries(terminals)) {
    qb[name] = vi.fn(async () => value);
  }
  return qb as Record<string, ReturnType<typeof vi.fn>>;
}

// ---------------------------------------------------------------------------
// Module-scope fixtures
// ---------------------------------------------------------------------------
const mockRawData = [
  { githubId: 1, url: 'htpps://example.com', omittedField: 'foo' },
  { githubId: 2, url: 'htpps://example.com', omittedField: 'bar' },
];

const mockCourseId = 12345;
const mockCourseTaskId = 54321;

type RepoMock = {
  find: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  createQueryBuilder: ReturnType<typeof vi.fn>;
};

function repoMock(): RepoMock {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
}

type Built = {
  service: CourseCrossCheckService;
  taskSolutionChecker: RepoMock;
  taskSolution: RepoMock;
  taskSolutionResult: RepoMock;
  courseTask: RepoMock;
  student: RepoMock;
  user: RepoMock;
  dataSource: Mocked<Pick<DataSource, 'createQueryBuilder'>>;
  writeScore: { saveScore: ReturnType<typeof vi.fn> };
};

async function buildService(): Promise<Built> {
  const taskSolutionChecker = repoMock();
  const taskSolution = repoMock();
  const taskSolutionResult = repoMock();
  const courseTask = repoMock();
  const student = repoMock();
  const user = repoMock();
  const dataSource = { createQueryBuilder: vi.fn() } as unknown as Mocked<Pick<DataSource, 'createQueryBuilder'>>;
  const writeScore = { saveScore: vi.fn() };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CourseCrossCheckService,
      { provide: getRepositoryToken(TaskSolutionChecker), useValue: taskSolutionChecker },
      { provide: getRepositoryToken(TaskSolution), useValue: taskSolution },
      { provide: getRepositoryToken(TaskSolutionResult), useValue: taskSolutionResult },
      { provide: getRepositoryToken(CourseTask), useValue: courseTask },
      { provide: getRepositoryToken(Student), useValue: student },
      { provide: getRepositoryToken(User), useValue: user },
      { provide: DataSource, useValue: dataSource },
      { provide: WriteScoreService, useValue: writeScore },
    ],
  }).compile();

  const service = module.get<CourseCrossCheckService>(CourseCrossCheckService);
  return {
    service,
    taskSolutionChecker,
    taskSolution,
    taskSolutionResult,
    courseTask,
    student,
    user,
    dataSource,
    writeScore,
  };
}

// ---------------------------------------------------------------------------

describe('CourseCrossCheckService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Pre-existing coverage: getSolutionsUrls
  // -------------------------------------------------------------------------
  describe('getSolutionsUrls', () => {
    it('should return transformed data from repositories correctly', async () => {
      const built = await buildService();
      built.taskSolution.createQueryBuilder.mockReturnValue(makeQb({ getRawMany: mockRawData }));

      const pairs = await built.service.getSolutionsUrls(mockCourseId, mockCourseTaskId);

      expect(pairs).toStrictEqual(mockRawData.map(data => ({ githubId: data.githubId, solutionUrl: data.url })));
    });
  });

  // -------------------------------------------------------------------------
  // static isCrossCheckTask / instance isCrossCheckTask
  // -------------------------------------------------------------------------
  describe('isCrossCheckTask', () => {
    it('static returns true only when checker === crossCheck', () => {
      expect(CourseCrossCheckService.isCrossCheckTask({ checker: 'crossCheck' } as never)).toBe(true);
      expect(CourseCrossCheckService.isCrossCheckTask({ checker: 'mentor' } as never)).toBe(false);
      expect(CourseCrossCheckService.isCrossCheckTask({})).toBe(false);
    });

    it('instance method mirrors the static behavior', async () => {
      const { service } = await buildService();
      expect(service.isCrossCheckTask({ checker: 'crossCheck' } as never)).toBe(true);
      expect(service.isCrossCheckTask({ checker: 'auto' } as never)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // isValidTaskSolution
  // -------------------------------------------------------------------------
  describe('isValidTaskSolution', () => {
    it('returns false when url is missing', () => {
      expect(CourseCrossCheckService.isValidTaskSolution({})).toBe(false);
      expect(CourseCrossCheckService.isValidTaskSolution({ url: '' })).toBe(false);
    });

    it('returns false when comments are present but not an array', () => {
      expect(CourseCrossCheckService.isValidTaskSolution({ url: 'u', comments: 'oops' as never })).toBe(false);
    });

    it('returns false when review is present but not an array', () => {
      expect(CourseCrossCheckService.isValidTaskSolution({ url: 'u', review: 'oops' as never })).toBe(false);
    });

    it('returns true for a valid payload (arrays or omitted)', () => {
      expect(CourseCrossCheckService.isValidTaskSolution({ url: 'u' })).toBe(true);
      expect(CourseCrossCheckService.isValidTaskSolution({ url: 'u', comments: [], review: [] })).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // isSubmissionDeadlinePassed
  // -------------------------------------------------------------------------
  describe('isSubmissionDeadlinePassed', () => {
    it('returns false when there is no studentEndDate', () => {
      expect(CourseCrossCheckService.isSubmissionDeadlinePassed({ studentEndDate: null } as CourseTask)).toBe(false);
    });

    it('returns true when the deadline is in the past', () => {
      expect(
        CourseCrossCheckService.isSubmissionDeadlinePassed({
          studentEndDate: '2000-01-01T00:00:00.000Z',
        } as unknown as CourseTask),
      ).toBe(true);
    });

    it('returns false when the deadline is in the future', () => {
      expect(
        CourseCrossCheckService.isSubmissionDeadlinePassed({
          studentEndDate: '2999-01-01T00:00:00.000Z',
        } as unknown as CourseTask),
      ).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // getCourseTask
  // -------------------------------------------------------------------------
  describe('getCourseTask', () => {
    it('queries by course task id and returns the result', async () => {
      const { service, courseTask } = await buildService();
      const row = { id: 15, task: { id: 5 } };
      const qb = makeQb({ getOne: row });
      courseTask.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getCourseTask(15);

      expect(courseTask.createQueryBuilder).toHaveBeenCalledWith('courseTask');
      expect(qb.innerJoinAndSelect).toHaveBeenCalledWith('courseTask.task', 'task');
      expect(qb.where).toHaveBeenCalledWith('courseTask.id = :courseTaskId', { courseTaskId: 15 });
      expect(result).toBe(row);
    });
  });

  // -------------------------------------------------------------------------
  // getCourseTaskWithCourse
  // -------------------------------------------------------------------------
  describe('getCourseTaskWithCourse', () => {
    it('joins task and course and returns the result', async () => {
      const { service, courseTask } = await buildService();
      const row = { id: 15, task: {}, course: {} };
      const qb = makeQb({ getOne: row });
      courseTask.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getCourseTaskWithCourse(15);

      expect(qb.innerJoinAndSelect).toHaveBeenCalledWith('courseTask.task', 'task');
      expect(qb.innerJoinAndSelect).toHaveBeenCalledWith('courseTask.course', 'course');
      expect(qb.where).toHaveBeenCalledWith('courseTask.id = :courseTaskId', { courseTaskId: 15 });
      expect(result).toBe(row);
    });
  });

  // -------------------------------------------------------------------------
  // changeCourseTaskStatus
  // -------------------------------------------------------------------------
  describe('changeCourseTaskStatus', () => {
    it('saves the course task with the new crossCheckStatus', async () => {
      const { service, courseTask } = await buildService();
      const task = { id: 15, crossCheckStatus: CrossCheckStatus.Initial } as CourseTask;

      await service.changeCourseTaskStatus(task, CrossCheckStatus.Completed);

      expect(courseTask.save).toHaveBeenCalledWith({ ...task, crossCheckStatus: CrossCheckStatus.Completed });
    });
  });

  // -------------------------------------------------------------------------
  // getTaskSolutionsWithoutChecker
  // -------------------------------------------------------------------------
  describe('getTaskSolutionsWithoutChecker', () => {
    it('selects solutions that have no checker and whose student is not expelled', async () => {
      const { service, taskSolution } = await buildService();
      const rows = [{ id: 1, studentId: 10 }];
      const qb = makeQb({ getMany: rows });
      taskSolution.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTaskSolutionsWithoutChecker(15);

      expect(taskSolution.createQueryBuilder).toHaveBeenCalledWith('ts');
      expect(qb.where).toHaveBeenCalledWith('ts."courseTaskId" = :courseTaskId', { courseTaskId: 15 });
      expect(qb.andWhere).toHaveBeenCalledWith('tsc.id IS NULL');
      expect(qb.andWhere).toHaveBeenCalledWith('s.isExpelled = false');
      expect(result).toBe(rows);
    });
  });

  // -------------------------------------------------------------------------
  // distributeCrossCheck
  // -------------------------------------------------------------------------
  describe('distributeCrossCheck', () => {
    it('returns empty pairs and skips distribution when there are no solutions', async () => {
      const { service, taskSolution, taskSolutionChecker, courseTask } = await buildService();
      taskSolution.createQueryBuilder.mockReturnValue(makeQb({ getMany: [] }));
      const task = { id: 15, pairsCount: 4 } as CourseTask;

      const distributeSpy = vi.spyOn(CrossCheckDistributionService.prototype, 'distribute');

      const result = await service.distributeCrossCheck(task, 15);

      expect(courseTask.save).toHaveBeenCalledWith({ ...task, crossCheckStatus: CrossCheckStatus.Distributed });
      expect(result).toEqual({ crossCheckPairs: [] });
      expect(distributeSpy).not.toHaveBeenCalled();
      expect(taskSolutionChecker.save).not.toHaveBeenCalled();
    });

    it('distributes, filters to known students and persists the pairs', async () => {
      const { service, taskSolution, taskSolutionChecker, courseTask } = await buildService();
      const solutions = [
        { id: 101, studentId: 1 },
        { id: 102, studentId: 2 },
      ];
      taskSolution.createQueryBuilder.mockReturnValue(makeQb({ getMany: solutions }));
      const task = { id: 15, pairsCount: 7 } as CourseTask;

      // pair for student 3 is not in solutionsMap and must be filtered out
      vi.spyOn(CrossCheckDistributionService.prototype, 'distribute').mockReturnValue([
        { checkerId: 2, studentId: 1 },
        { checkerId: 1, studentId: 2 },
        { checkerId: 1, studentId: 3 },
      ]);

      const result = await service.distributeCrossCheck(task, 15);

      expect(CrossCheckDistributionService.prototype.distribute).toHaveBeenCalledWith([1, 2], 7);
      expect(courseTask.save).toHaveBeenCalledWith({ ...task, crossCheckStatus: CrossCheckStatus.Distributed });
      expect(result.crossCheckPairs).toEqual([
        { checkerId: 2, studentId: 1, courseTaskId: 15, taskSolutionId: 101 },
        { checkerId: 1, studentId: 2, courseTaskId: 15, taskSolutionId: 102 },
      ]);
      expect(taskSolutionChecker.save).toHaveBeenCalledWith(result.crossCheckPairs);
    });

    it('passes undefined pairsCount through to distribute when not set', async () => {
      const { service, taskSolution, taskSolutionChecker } = await buildService();
      taskSolution.createQueryBuilder.mockReturnValue(makeQb({ getMany: [{ id: 101, studentId: 1 }] }));
      const task = { id: 15, pairsCount: null } as unknown as CourseTask;
      vi.spyOn(CrossCheckDistributionService.prototype, 'distribute').mockReturnValue([{ checkerId: 1, studentId: 1 }]);

      await service.distributeCrossCheck(task, 15);

      expect(CrossCheckDistributionService.prototype.distribute).toHaveBeenCalledWith([1], undefined);
      expect(taskSolutionChecker.save).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // runDistribution
  // -------------------------------------------------------------------------
  describe('runDistribution', () => {
    it('throws BadRequestException when the course task is not found', async () => {
      const { service, courseTask } = await buildService();
      courseTask.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      await expect(service.runDistribution(15)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the submission deadline has not passed', async () => {
      const { service, courseTask } = await buildService();
      courseTask.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { id: 15, studentEndDate: '2999-01-01T00:00:00.000Z' } }),
      );

      await expect(service.runDistribution(15)).rejects.toThrow(BadRequestException);
    });

    it('delegates to distributeCrossCheck once the deadline has passed', async () => {
      const { service, courseTask } = await buildService();
      const task = { id: 15, studentEndDate: '2000-01-01T00:00:00.000Z' };
      courseTask.createQueryBuilder.mockReturnValue(makeQb({ getOne: task }));
      const distributeSpy = vi.spyOn(service, 'distributeCrossCheck').mockResolvedValue({ crossCheckPairs: [] });

      const result = await service.runDistribution(15);

      expect(distributeSpy).toHaveBeenCalledWith(task, 15);
      expect(result).toEqual({ crossCheckPairs: [] });
    });
  });

  // -------------------------------------------------------------------------
  // runCompletion
  // -------------------------------------------------------------------------
  describe('runCompletion', () => {
    it('throws BadRequestException when the course task is not found', async () => {
      const { service, courseTask } = await buildService();
      courseTask.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      await expect(service.runCompletion(15)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the deadline has not passed', async () => {
      const { service, courseTask } = await buildService();
      courseTask.createQueryBuilder.mockReturnValue(
        makeQb({
          getOne: {
            id: 15,
            studentEndDate: '2999-01-01T00:00:00.000Z',
            crossCheckStatus: CrossCheckStatus.Distributed,
          },
        }),
      );

      await expect(service.runCompletion(15)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the status is still Initial', async () => {
      const { service, courseTask } = await buildService();
      courseTask.createQueryBuilder.mockReturnValue(
        makeQb({
          getOne: { id: 15, studentEndDate: '2000-01-01T00:00:00.000Z', crossCheckStatus: CrossCheckStatus.Initial },
        }),
      );

      await expect(service.runCompletion(15)).rejects.toThrow(BadRequestException);
    });

    it('saves a Cross-Check score per student and marks the task Completed', async () => {
      const { service, courseTask, writeScore } = await buildService();
      const task = {
        id: 15,
        pairsCount: 4,
        studentEndDate: '2000-01-01T00:00:00.000Z',
        crossCheckStatus: CrossCheckStatus.Distributed,
      } as CourseTask;
      courseTask.createQueryBuilder.mockReturnValue(makeQb({ getOne: task }));
      const scores = [
        { studentId: 1, score: 80 },
        { studentId: 2, score: 90 },
      ];
      vi.spyOn(service, 'getTaskSolutionCheckers').mockResolvedValue(scores);
      const statusSpy = vi.spyOn(service, 'changeCourseTaskStatus').mockResolvedValue(undefined);

      await service.runCompletion(15);

      // pairsCount 4 -> minCheckedCount = max(4 - 1, 1) = 3
      expect(service.getTaskSolutionCheckers).toHaveBeenCalledWith(15, 3);
      expect(writeScore.saveScore).toHaveBeenCalledTimes(2);
      expect(writeScore.saveScore).toHaveBeenNthCalledWith(1, 1, 15, {
        authorId: -1,
        comment: 'Cross-Check score',
        score: 80,
      });
      expect(writeScore.saveScore).toHaveBeenNthCalledWith(2, 2, 15, {
        authorId: -1,
        comment: 'Cross-Check score',
        score: 90,
      });
      expect(statusSpy).toHaveBeenCalledWith(task, CrossCheckStatus.Completed);
    });

    it('defaults pairsCount to DEFAULT (4) and floors minCheckedCount at 1', async () => {
      const { service, courseTask } = await buildService();
      // pairsCount = 1 -> max(1 - 1, 1) = 1 (exercises the Math.max floor branch)
      const task = {
        id: 15,
        pairsCount: 1,
        studentEndDate: '2000-01-01T00:00:00.000Z',
        crossCheckStatus: CrossCheckStatus.Distributed,
      } as CourseTask;
      courseTask.createQueryBuilder.mockReturnValue(makeQb({ getOne: task }));
      const checkersSpy = vi.spyOn(service, 'getTaskSolutionCheckers').mockResolvedValue([]);
      vi.spyOn(service, 'changeCourseTaskStatus').mockResolvedValue(undefined);

      await service.runCompletion(15);

      expect(checkersSpy).toHaveBeenCalledWith(15, 1);
    });

    it('uses DEFAULT_PAIRS_COUNT when pairsCount is null', async () => {
      const { service, courseTask } = await buildService();
      const task = {
        id: 15,
        pairsCount: null,
        studentEndDate: '2000-01-01T00:00:00.000Z',
        crossCheckStatus: CrossCheckStatus.Distributed,
      } as unknown as CourseTask;
      courseTask.createQueryBuilder.mockReturnValue(makeQb({ getOne: task }));
      const checkersSpy = vi.spyOn(service, 'getTaskSolutionCheckers').mockResolvedValue([]);
      vi.spyOn(service, 'changeCourseTaskStatus').mockResolvedValue(undefined);

      await service.runCompletion(15);

      // default 4 -> max(4 - 1, 1) = 3
      expect(checkersSpy).toHaveBeenCalledWith(15, 3);
    });
  });

  // -------------------------------------------------------------------------
  // getTaskSolutionCheckers
  // -------------------------------------------------------------------------
  describe('getTaskSolutionCheckers', () => {
    it('builds the aggregation query and maps records to numeric scores', async () => {
      const { service, dataSource } = await buildService();
      const rawRows = [
        { studentId: 1, score: '80' },
        { studentId: 2, score: 90 },
      ];
      const qb = makeQb({ getRawMany: rawRows });
      (dataSource.createQueryBuilder as ReturnType<typeof vi.fn>).mockReturnValue(qb);

      const result = await service.getTaskSolutionCheckers(15, 3);

      expect(qb.where).toHaveBeenCalledWith('rownum <= :count', { count: 3 });
      expect(qb.groupBy).toHaveBeenCalledWith('"studentId"');
      expect(result).toEqual([
        { studentId: 1, score: 80 },
        { studentId: 2, score: 90 },
      ]);
    });

    it('exercises the inner sub-query builder callbacks', async () => {
      const { service, dataSource } = await buildService();
      // The outer .from receives a builder callback; invoke it with a nested qb
      // so the inner sub-query construction (and its .where callback) is executed.
      const innerQb = makeQb();
      const outerQb = makeQb({ getRawMany: [] });
      // from(callback, alias) -> call the callback with innerQb to run the nested builder
      (outerQb.from as ReturnType<typeof vi.fn>).mockImplementation((arg: unknown) => {
        if (typeof arg === 'function') {
          (arg as (qb: unknown) => unknown)(innerQb);
        }
        return outerQb;
      });
      // The nested .where receives a callback that builds a sub-query
      (innerQb.where as ReturnType<typeof vi.fn>).mockImplementation((arg: unknown) => {
        if (typeof arg === 'function') {
          (arg as (qb: unknown) => unknown)(innerQb);
        }
        return innerQb;
      });
      (dataSource.createQueryBuilder as ReturnType<typeof vi.fn>).mockReturnValue(outerQb);

      const result = await service.getTaskSolutionCheckers(15, 2);

      expect(innerQb.subQuery).toHaveBeenCalled();
      expect(innerQb.getQuery).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // getTaskDetails
  // -------------------------------------------------------------------------
  describe('getTaskDetails', () => {
    it('returns criteria and studentEndDate when present', async () => {
      const { service, courseTask } = await buildService();
      const criteria = [{ key: 'c1', max: 10, text: 'Quality', type: 'subtask' }];
      courseTask.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { studentEndDate: 'd', task: { attributes: { criteria } } } }),
      );

      expect(await service.getTaskDetails(15)).toEqual({ criteria, studentEndDate: 'd' });
    });

    it('returns empty criteria when the task has no attributes', async () => {
      const { service, courseTask } = await buildService();
      courseTask.createQueryBuilder.mockReturnValue(makeQb({ getOne: { studentEndDate: 'd', task: {} } }));

      expect(await service.getTaskDetails(15)).toEqual({ criteria: [], studentEndDate: 'd' });
    });

    it('returns empty details when the course task is not found', async () => {
      const { service, courseTask } = await buildService();
      courseTask.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      expect(await service.getTaskDetails(15)).toEqual({ criteria: [], studentEndDate: undefined });
    });
  });

  // -------------------------------------------------------------------------
  // queryStudentByGithubId
  // -------------------------------------------------------------------------
  describe('queryStudentByGithubId', () => {
    it('maps the record to id/name/githubId/userId', async () => {
      const { service, student } = await buildService();
      student.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { id: 31, user: { id: 101, firstName: ' John ', lastName: 'Doe', githubId: 'john-doe' } } }),
      );

      expect(await service.queryStudentByGithubId(11, 'john-doe')).toEqual({
        id: 31,
        name: 'John Doe',
        githubId: 'john-doe',
        userId: 101,
      });
    });

    it('returns null when the student is not found', async () => {
      const { service, student } = await buildService();
      student.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      expect(await service.queryStudentByGithubId(11, 'missing')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getTaskSolutionResultById
  // -------------------------------------------------------------------------
  describe('getTaskSolutionResultById', () => {
    it('queries the result by id', async () => {
      const { service, taskSolutionResult } = await buildService();
      const row = { id: 71 };
      const qb = makeQb({ getOne: row });
      taskSolutionResult.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTaskSolutionResultById(71);

      expect(qb.where).toHaveBeenCalledWith('"taskSolutionResult"."id" = :id', { id: 71 });
      expect(result).toBe(row);
    });
  });

  // -------------------------------------------------------------------------
  // saveMessage
  // -------------------------------------------------------------------------
  describe('saveMessage', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-04-01T10:00:00.000Z'));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('appends a reviewer message marked reviewer-read', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { id: 71, messages: [{ content: 'old' }] } }),
      );

      await service.saveMessage(
        71,
        { content: 'hi', role: CrossCheckMessageAuthorRole.Reviewer },
        { user: { id: 102, githubId: 'kate' } },
      );

      expect(taskSolutionResult.update).toHaveBeenCalledWith(71, {
        messages: [
          { content: 'old' },
          {
            content: 'hi',
            role: CrossCheckMessageAuthorRole.Reviewer,
            timestamp: '2024-04-01T10:00:00.000Z',
            author: { id: 102, githubId: 'kate' },
            isReviewerRead: true,
            isStudentRead: false,
          },
        ],
      });
    });

    it('marks a student message student-read', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getOne: { id: 71, messages: [] } }));

      await service.saveMessage(
        71,
        { content: 'hi', role: CrossCheckMessageAuthorRole.Student },
        { user: { id: 101, githubId: 'john' } },
      );

      expect(taskSolutionResult.update).toHaveBeenCalledWith(71, {
        messages: [expect.objectContaining({ isReviewerRead: false, isStudentRead: true })],
      });
    });

    it('does nothing when the result does not exist', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      await service.saveMessage(
        71,
        { content: 'hi', role: CrossCheckMessageAuthorRole.Student },
        { user: { id: 101, githubId: 'john' } },
      );

      expect(taskSolutionResult.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // updateMessage
  // -------------------------------------------------------------------------
  describe('updateMessage', () => {
    it('marks all messages reviewer-read when role is reviewer', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(
        makeQb({
          getOne: {
            id: 71,
            messages: [
              { content: 'a', isReviewerRead: false, isStudentRead: false },
              { content: 'b', isReviewerRead: false, isStudentRead: true },
            ],
          },
        }),
      );

      await service.updateMessage(71, { role: CrossCheckMessageAuthorRole.Reviewer });

      expect(taskSolutionResult.update).toHaveBeenCalledWith(71, {
        messages: [
          { content: 'a', isReviewerRead: true, isStudentRead: false },
          { content: 'b', isReviewerRead: true, isStudentRead: true },
        ],
      });
    });

    it('marks all messages student-read when role is student', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { id: 71, messages: [{ content: 'a', isReviewerRead: true, isStudentRead: false }] } }),
      );

      await service.updateMessage(71, { role: CrossCheckMessageAuthorRole.Student });

      expect(taskSolutionResult.update).toHaveBeenCalledWith(71, {
        messages: [{ content: 'a', isReviewerRead: true, isStudentRead: true }],
      });
    });

    it('does nothing when the result does not exist', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      await service.updateMessage(71, { role: CrossCheckMessageAuthorRole.Student });

      expect(taskSolutionResult.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // getMessageRecipientId
  // -------------------------------------------------------------------------
  describe('getMessageRecipientId', () => {
    it('returns the studentId when the author is the reviewer', async () => {
      const { service, student } = await buildService();

      const result = await service.getMessageRecipientId(31, 32, CrossCheckMessageAuthorRole.Reviewer);

      expect(result).toBe(31);
      expect(student.findOne).not.toHaveBeenCalled();
    });

    it('resolves the checker userId when the author is the student', async () => {
      const { service, student } = await buildService();
      student.findOne.mockResolvedValue({ id: 32, userId: 102 });

      const result = await service.getMessageRecipientId(31, 32, CrossCheckMessageAuthorRole.Student);

      expect(student.findOne).toHaveBeenCalledWith({ where: { id: 32 } });
      expect(result).toBe(102);
    });

    it('returns undefined when the checker is not found', async () => {
      const { service, student } = await buildService();
      student.findOne.mockResolvedValue(null);

      const result = await service.getMessageRecipientId(31, 32, CrossCheckMessageAuthorRole.Student);

      expect(result).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // saveSolution
  // -------------------------------------------------------------------------
  describe('saveSolution', () => {
    it('merges into the existing solution concatenating comments', async () => {
      const { service, taskSolution } = await buildService();
      taskSolution.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { id: 51, studentId: 31, courseTaskId: 15, url: 'old', comments: [{ text: 'old' }] } }),
      );

      await service.saveSolution(31, 15, { url: 'new', comments: [{ text: 'new' }] as never });

      expect(taskSolution.save).toHaveBeenCalledWith({
        id: 51,
        studentId: 31,
        courseTaskId: 15,
        url: 'new',
        comments: [{ text: 'old' }, { text: 'new' }],
      });
    });

    it('merges with empty new comments (defaults to [])', async () => {
      const { service, taskSolution } = await buildService();
      taskSolution.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { id: 51, studentId: 31, courseTaskId: 15, url: 'old', comments: [{ text: 'old' }] } }),
      );

      await service.saveSolution(31, 15, { url: 'new' });

      expect(taskSolution.save).toHaveBeenCalledWith({
        id: 51,
        studentId: 31,
        courseTaskId: 15,
        url: 'new',
        comments: [{ text: 'old' }],
      });
    });

    it('creates a new solution when none exists', async () => {
      const { service, taskSolution } = await buildService();
      taskSolution.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      await service.saveSolution(31, 15, { url: 'new', review: [] as never, comments: [] as never });

      expect(taskSolution.save).toHaveBeenCalledWith({
        studentId: 31,
        courseTaskId: 15,
        url: 'new',
        review: [],
        comments: [],
      });
    });
  });

  // -------------------------------------------------------------------------
  // deleteSolution
  // -------------------------------------------------------------------------
  describe('deleteSolution', () => {
    it('deletes by studentId and courseTaskId', async () => {
      const { service, taskSolution } = await buildService();

      await service.deleteSolution(31, 15);

      expect(taskSolution.delete).toHaveBeenCalledWith({ studentId: 31, courseTaskId: 15 });
    });
  });

  // -------------------------------------------------------------------------
  // getTaskSolution
  // -------------------------------------------------------------------------
  describe('getTaskSolution', () => {
    it('queries the solution by student and course task', async () => {
      const { service, taskSolution } = await buildService();
      const row = { id: 51 };
      const qb = makeQb({ getOne: row });
      taskSolution.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTaskSolution(31, 15);

      expect(qb.where).toHaveBeenCalledWith('"ts"."studentId" = :studentId', { studentId: 31 });
      expect(qb.andWhere).toHaveBeenCalledWith('"ts"."courseTaskId" = :courseTaskId', { courseTaskId: 15 });
      expect(result).toBe(row);
    });
  });

  // -------------------------------------------------------------------------
  // getTaskSolutionAssignments
  // -------------------------------------------------------------------------
  describe('getTaskSolutionAssignments', () => {
    it('queries assignments by checker and course task', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const rows = [{ student: { id: 31 }, taskSolution: { url: 'u' } }];
      const qb = makeQb({ getMany: rows });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTaskSolutionAssignments(32, 15);

      expect(qb.where).toHaveBeenCalledWith('"taskSolutionChecker"."checkerId" = :checkerId', { checkerId: 32 });
      expect(qb.andWhere).toHaveBeenCalledWith('"taskSolutionChecker"."courseTaskId" = :courseTaskId', {
        courseTaskId: 15,
      });
      expect(result).toBe(rows);
    });
  });

  // -------------------------------------------------------------------------
  // convertToStudentBasic (static)
  // -------------------------------------------------------------------------
  describe('convertToStudentBasic', () => {
    it('maps an active student with full user fields', () => {
      const result = CourseCrossCheckService.convertToStudentBasic({
        id: 31,
        isExpelled: false,
        isFailed: false,
        totalScore: 90.5,
        user: {
          githubId: 'john-doe',
          firstName: ' John ',
          lastName: 'Doe',
          cityName: 'Minsk',
          countryName: 'Belarus',
          discord: { id: '1', username: 'john' },
        },
      } as never);

      expect(result).toEqual({
        name: 'John Doe',
        isActive: true,
        id: 31,
        githubId: 'john-doe',
        mentor: null,
        cityName: 'Minsk',
        countryName: 'Belarus',
        discord: { id: '1', username: 'john' },
        totalScore: 90.5,
      });
    });

    it('marks expelled/failed students inactive and defaults missing city/country', () => {
      const result = CourseCrossCheckService.convertToStudentBasic({
        id: 33,
        isExpelled: true,
        isFailed: false,
        totalScore: 0,
        user: { githubId: 'jane', firstName: 'Jane', lastName: null, cityName: null, countryName: null, discord: null },
      } as never);

      expect(result).toMatchObject({ isActive: false, cityName: '', countryName: '', discord: null, name: 'Jane' });
    });
  });

  // -------------------------------------------------------------------------
  // getTaskSolutionChecker
  // -------------------------------------------------------------------------
  describe('getTaskSolutionChecker', () => {
    it('queries by student, checker and course task', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const row = { id: 71 };
      const qb = makeQb({ getOne: row });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTaskSolutionChecker(31, 32, 15);

      expect(qb.where).toHaveBeenCalledWith('"taskSolutionChecker"."studentId" = :studentId', { studentId: 31 });
      expect(qb.andWhere).toHaveBeenCalledWith('"taskSolutionChecker"."checkerId" = :checkerId', { checkerId: 32 });
      expect(qb.andWhere).toHaveBeenCalledWith('"taskSolutionChecker"."courseTaskId" = :courseTaskId', {
        courseTaskId: 15,
      });
      expect(result).toBe(row);
    });
  });

  // -------------------------------------------------------------------------
  // saveResult
  // -------------------------------------------------------------------------
  describe('saveResult', () => {
    beforeEach(() => {
      vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    });

    const data = { score: 42, comment: 'good', anonymous: false, review: [] as never[] };
    const criteria = [{ key: 'c1', max: 10, text: 'Q', type: 'subtask' }] as never[];

    it('updates the existing result and returns the previous when score/comment changed', async () => {
      const { service, taskSolutionResult } = await buildService();
      const existing = { id: 81, score: 10, comment: 'old', historicalScores: [{ score: 10 }] };
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getOne: existing }));

      const previous = await service.saveResult(15, 31, 32, data, { userId: 102, criteria });

      expect(taskSolutionResult.update).toHaveBeenCalledWith(81, {
        ...data,
        historicalScores: [{ score: 10 }, { ...data, criteria, authorId: 102, dateTime: 1700000000000 }],
      });
      expect(previous).toEqual({ ...existing, historicalScores: existing.historicalScores });
    });

    it('returns undefined when score and comment are unchanged', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { id: 81, score: 42, comment: 'good', historicalScores: [] } }),
      );

      const previous = await service.saveResult(15, 31, 32, data, { userId: 102, criteria });

      expect(taskSolutionResult.update).toHaveBeenCalled();
      expect(previous).toBeUndefined();
    });

    it('inserts a new result when none exists', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      const previous = await service.saveResult(15, 31, 32, data, { userId: 102, criteria });

      expect(taskSolutionResult.insert).toHaveBeenCalledWith({
        studentId: 31,
        checkerId: 32,
        courseTaskId: 15,
        historicalScores: [{ ...data, criteria, authorId: 102, dateTime: 1700000000000 }],
        messages: [],
        ...data,
      });
      expect(previous).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // saveSolutionComments
  // -------------------------------------------------------------------------
  describe('saveSolutionComments', () => {
    it('appends new comments deduplicating by criteriaId+timestamp', async () => {
      const { service, taskSolution } = await buildService();
      taskSolution.createQueryBuilder.mockReturnValue(
        makeQb({ getOne: { id: 51, comments: [{ text: 'old', criteriaId: 'c1', timestamp: 1, authorId: 31 }] } }),
      );

      await service.saveSolutionComments(31, 15, {
        comments: [
          { text: 'dup', criteriaId: 'c1', timestamp: 1 },
          { text: 'new', criteriaId: 'c2', timestamp: 2 },
        ] as never[],
        authorId: 32,
        authorGithubId: 'kate',
        recipientId: 31,
      });

      expect(taskSolution.save).toHaveBeenCalledWith({
        id: 51,
        comments: [
          { text: 'old', criteriaId: 'c1', timestamp: 1, authorId: 31 },
          { text: 'new', criteriaId: 'c2', timestamp: 2, authorId: 32, recipientId: 31 },
        ],
      });
    });

    it('throws when the solution is not found', async () => {
      const { service, taskSolution } = await buildService();
      taskSolution.createQueryBuilder.mockReturnValue(makeQb({ getOne: null }));

      await expect(
        service.saveSolutionComments(31, 15, {
          comments: [] as never[],
          authorId: 32,
          authorGithubId: 'kate',
        }),
      ).rejects.toThrow('Cross check solution not found');
    });
  });

  // -------------------------------------------------------------------------
  // getResult
  // -------------------------------------------------------------------------
  describe('getResult', () => {
    const reviewResult = {
      id: 81,
      score: 42,
      comment: null,
      anonymous: true,
      review: [{ percentage: 1, criteriaId: 'c1' }],
      historicalScores: null,
      messages: [{ content: 'hi' }],
    };
    const solution = {
      id: 51,
      studentId: 31,
      comments: [
        { text: 'to all', timestamp: 1, criteriaId: 'c1', authorId: 31, recipientId: null },
        { text: 'from checker', timestamp: 2, criteriaId: 'c1', authorId: 32, recipientId: 31 },
        { text: 'to checker', timestamp: 3, criteriaId: 'c2', authorId: 31, recipientId: 32 },
        { text: 'foreign private', timestamp: 4, criteriaId: 'c2', authorId: 33, recipientId: 34 },
      ],
    };
    const checkerUser = { id: 102, firstName: ' Kate ', lastName: 'Checker', discord: { id: '1', username: 'kate' } };

    function wire(built: Built, opts: { review?: unknown; sol?: unknown } = {}) {
      const resultQb = makeQb({ getOne: 'review' in opts ? opts.review : reviewResult });
      const solQb = makeQb({ getOne: 'sol' in opts ? opts.sol : solution });
      const studentsQb = makeQb({
        getMany: [
          { id: 31, user: { githubId: 'john-doe' } },
          { id: 32, user: { githubId: 'kate-checker' } },
        ],
      });
      // findReviewResult + getResult's later not used; result repo only used for findReviewResult
      built.taskSolutionResult.createQueryBuilder.mockReturnValue(resultQb);
      built.taskSolution.createQueryBuilder.mockReturnValue(solQb);
      built.student.createQueryBuilder.mockReturnValue(studentsQb);
      built.user.findOne.mockResolvedValue(checkerUser);
    }

    it('returns the review with visible comments and resolved github ids (anonymous)', async () => {
      const built = await buildService();
      wire(built);

      const result = await built.service.getResult(15, 31, 32, 'Kate-Checker');

      expect(built.user.findOne).toHaveBeenCalledWith({ where: { githubId: 'kate-checker' } });
      expect(result).toEqual({
        id: 81,
        score: 42,
        comment: '',
        anonymous: true,
        review: [{ percentage: 1, criteriaId: 'c1' }],
        checkerId: 32,
        studentId: 31,
        author: {
          id: 102,
          name: 'Kate Checker',
          githubId: 'Kate-Checker',
          discord: { id: '1', username: 'kate' },
        },
        comments: [
          { text: 'to all', timestamp: 1, criteriaId: 'c1', authorId: 31, authorGithubId: 'john-doe' },
          { text: 'from checker', timestamp: 2, criteriaId: 'c1', authorId: 32, authorGithubId: 'kate-checker' },
          { text: 'to checker', timestamp: 3, criteriaId: 'c2', authorId: 31, authorGithubId: 'john-doe' },
        ],
        historicalScores: [],
        messages: [{ content: 'hi' }],
      });
    });

    it('hides the author github id of a third-party broadcast comment when anonymous', async () => {
      const built = await buildService();
      // broadcast comment (recipientId null) authored by neither student nor checker -> visible but anonymized
      wire(built, {
        sol: {
          id: 51,
          studentId: 31,
          comments: [{ text: 'broadcast', timestamp: 9, criteriaId: 'c1', authorId: 99, recipientId: null }],
        },
      });
      built.student.createQueryBuilder.mockReturnValue(
        makeQb({ getMany: [{ id: 99, user: { githubId: 'someone' } }] }),
      );

      const result = await built.service.getResult(15, 31, 32, 'kate-checker');

      expect(result?.comments).toEqual([
        { text: 'broadcast', timestamp: 9, criteriaId: 'c1', authorId: 99, authorGithubId: null },
      ]);
    });

    it('exposes all author github ids when the review is not anonymous', async () => {
      const built = await buildService();
      wire(built, { review: { ...reviewResult, anonymous: false } });

      const result = await built.service.getResult(15, 31, 32, 'kate-checker');

      expect(result?.comments.map(c => c.authorGithubId)).toEqual(['john-doe', 'kate-checker', 'john-doe']);
    });

    it('returns null when there is no review result', async () => {
      const built = await buildService();
      wire(built, { review: null });

      expect(await built.service.getResult(15, 31, 32, 'kate-checker')).toBeNull();
    });

    it('returns null when there is no solution', async () => {
      const built = await buildService();
      wire(built, { sol: null });

      expect(await built.service.getResult(15, 31, 32, 'kate-checker')).toBeNull();
    });

    it('defaults comments to [] when the solution has no comments', async () => {
      const built = await buildService();
      wire(built, { sol: { id: 51, studentId: 31, comments: null } });

      const result = await built.service.getResult(15, 31, 32, 'kate-checker');

      expect(result?.comments).toEqual([]);
    });

    it('falls back to id 0 and empty name when the checker user is missing', async () => {
      const built = await buildService();
      wire(built);
      built.user.findOne.mockResolvedValue(null);

      const result = await built.service.getResult(15, 31, 32, 'kate-checker');

      expect(result?.author).toEqual({ id: 0, name: '', githubId: 'kate-checker', discord: null });
    });
  });

  // -------------------------------------------------------------------------
  // findPairs
  // -------------------------------------------------------------------------
  describe('findPairs', () => {
    const rawRow = {
      chu_firstName: 'Kate',
      chu_lastName: 'Checker',
      chu_githubId: 'kate',
      tsc_checkerId: 32,
      stu_firstName: 'John',
      stu_lastName: 'Doe',
      stu_githubId: 'john',
      tsc_studentId: 31,
      t_name: 'JS Task',
      tsc_courseTaskId: 15,
      ts_url: 'https://x',
      st_repository: 'repo',
      tsr_score: 42,
      tsr_comment: 'good',
      ts_updatedDate: '2024-04-01',
      tsr_historicalScores: [{ dateTime: 123 }],
      tsr_messages: [{ content: 'm' }],
      tsc_id: 71,
    };

    it('maps raw rows to CrossCheckPair and computes pagination', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const qb = makeQb({ getRawMany: [rawRow], getCount: 1 });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findPairs(11, { pageSize: 10, current: 1 });

      expect(qb.where).toHaveBeenCalledWith('ct."courseId" = :courseId', { courseId: 11 });
      expect(qb.limit).toHaveBeenCalledWith(10);
      expect(qb.offset).toHaveBeenCalledWith(0);
      expect(result.items).toEqual([
        {
          checker: { firstName: 'Kate', lastName: 'Checker', githubId: 'kate', id: 32 },
          student: { firstName: 'John', lastName: 'Doe', githubId: 'john', id: 31 },
          courseTask: { name: 'JS Task', id: 15 },
          url: 'https://x',
          privateRepository: 'repo',
          score: 42,
          comment: 'good',
          submittedDate: '2024-04-01',
          reviewedDate: 123,
          messages: [{ content: 'm' }],
          historicalScores: [{ dateTime: 123 }],
          id: 71,
        },
      ]);
      expect(result.pagination).toEqual({ current: 1, pageSize: 10, total: 1, totalPages: 1 });
    });

    it('uses default pagination when none is supplied', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const qb = makeQb({ getRawMany: [], getCount: 250 });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findPairs(11);

      expect(qb.limit).toHaveBeenCalledWith(100);
      expect(qb.offset).toHaveBeenCalledWith(0);
      expect(result.pagination).toEqual({ current: 1, pageSize: 100, total: 250, totalPages: 3 });
    });

    it('applies every filter when provided', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const qb = makeQb({ getRawMany: [], getCount: 0 });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      await service.findPairs(11, { pageSize: 5, current: 2 }, { checker: 'a', student: 'b', task: 'c', url: 'd' });

      expect(qb.andWhere).toHaveBeenCalledWith('chu."githubId" ILIKE :checker', { checker: '%a%' });
      expect(qb.andWhere).toHaveBeenCalledWith('stu."githubId" ILIKE :student', { student: '%b%' });
      expect(qb.andWhere).toHaveBeenCalledWith('t.name ILIKE :task', { task: '%c%' });
      expect(qb.andWhere).toHaveBeenCalledWith('ts.url ILIKE :url', { url: '%d%' });
      // current 2, pageSize 5 -> offset 5
      expect(qb.offset).toHaveBeenCalledWith(5);
    });

    it('applies ordering with the field mapping and direction', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const qb = makeQb({ getRawMany: [], getCount: 0 });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      await service.findPairs(11, { pageSize: 5, current: 1 }, undefined, {
        orderBy: OrderField.Score,
        orderDirection: OrderDirection.Desc,
      });

      expect(qb.orderBy).toHaveBeenCalledWith('tsr.score', 'DESC');
    });

    it('defaults order direction to ASC when omitted', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const qb = makeQb({ getRawMany: [], getCount: 0 });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      await service.findPairs(11, { pageSize: 5, current: 1 }, undefined, {
        orderBy: OrderField.Checker,
        orderDirection: undefined as never,
      });

      expect(qb.orderBy).toHaveBeenCalledWith('chu.githubId', 'ASC');
    });

    it('skips ordering when the order field has no mapping', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const qb = makeQb({ getRawMany: [], getCount: 0 });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      await service.findPairs(11, { pageSize: 5, current: 1 }, undefined, {
        orderBy: 'nonexistent' as never,
        orderDirection: OrderDirection.Asc,
      });

      expect(qb.orderBy).not.toHaveBeenCalled();
    });

    it('leaves reviewedDate undefined when there are no historical scores', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const qb = makeQb({ getRawMany: [{ ...rawRow, tsr_historicalScores: null }], getCount: 1 });
      taskSolutionChecker.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findPairs(11, { pageSize: 10, current: 1 });

      expect(result.items[0]!.reviewedDate).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // getAvailableCrossChecksStats
  // -------------------------------------------------------------------------
  describe('getAvailableCrossChecksStats', () => {
    it('counts checks and completed checks per task and drops tasks with no checks', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const tasks = [
        { id: 1, task: { name: 'Task A' } },
        { id: 2, task: { name: 'Task B' } },
        { id: 3, task: { name: 'Task C' } },
      ] as unknown as CourseTask[];
      // task 1: two checks, one completed; task 2: one check, none completed; task 3: no checks
      const rows = [
        { tsc_courseTaskId: 1, tsr_score: 42 },
        { tsc_courseTaskId: 1, tsr_score: null },
        { tsc_courseTaskId: 2, tsr_score: null },
      ];
      taskSolutionChecker.createQueryBuilder.mockReturnValue(makeQb({ getRawMany: rows }));

      const result = await service.getAvailableCrossChecksStats(tasks, 32);

      expect(result).toEqual([
        { name: 'Task A', id: 1, checksCount: 2, completedChecksCount: 1 },
        { name: 'Task B', id: 2, checksCount: 1, completedChecksCount: 0 },
      ]);
    });

    it('returns an empty list when there are no checks at all', async () => {
      const { service, taskSolutionChecker } = await buildService();
      const tasks = [{ id: 1, task: { name: 'Task A' } }] as unknown as CourseTask[];
      taskSolutionChecker.createQueryBuilder.mockReturnValue(makeQb({ getRawMany: [] }));

      expect(await service.getAvailableCrossChecksStats(tasks, 32)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // getCrossCheckSolutionReviews + transform helpers
  // -------------------------------------------------------------------------
  describe('getCrossCheckSolutionReviews', () => {
    const baseResult = {
      id: 81,
      comment: 'great',
      score: 42,
      anonymous: false,
      historicalScores: [
        { dateTime: 100, criteria: [{ key: 'c1' }] },
        { dateTime: 300, criteria: [{ key: 'c2' }] },
        { dateTime: 200, criteria: [{ key: 'c3' }] },
      ],
      messages: [
        { content: 'r', role: CrossCheckMessageAuthorRole.Reviewer, author: { id: 102, githubId: 'kate' } },
        { content: 's', role: CrossCheckMessageAuthorRole.Student, author: { id: 101, githubId: 'john' } },
      ],
      checker: { user: { id: 102, firstName: 'Kate', lastName: 'Checker', githubId: 'kate', discord: null } },
    };

    it('maps a non-anonymous review with author, latest criteria and intact messages', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getMany: [baseResult] }));

      const result = await service.getCrossCheckSolutionReviews(31, 15);

      expect(result).toEqual([
        {
          id: 81,
          comment: 'great',
          score: 42,
          dateTime: 300,
          criteria: [{ key: 'c2' }],
          author: { id: 102, name: 'Kate Checker', githubId: 'kate', discord: null },
          messages: baseResult.messages,
        },
      ]);
    });

    it('hides the author and reviewer message authors when anonymous', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getMany: [{ ...baseResult, anonymous: true }] }));

      const [review] = await service.getCrossCheckSolutionReviews(31, 15);

      expect(review!.author).toBeNull();
      expect(review!.messages).toEqual([
        { content: 'r', role: CrossCheckMessageAuthorRole.Reviewer, author: null },
        { content: 's', role: CrossCheckMessageAuthorRole.Student, author: { id: 101, githubId: 'john' } },
      ]);
    });

    it('defaults the comment to empty string when null', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getMany: [{ ...baseResult, comment: null }] }));

      const [review] = await service.getCrossCheckSolutionReviews(31, 15);

      expect(review!.comment).toBe('');
    });

    it('throws BadRequestException when there are no historical scores', async () => {
      const { service, taskSolutionResult } = await buildService();
      taskSolutionResult.createQueryBuilder.mockReturnValue(
        makeQb({ getMany: [{ ...baseResult, historicalScores: [] }] }),
      );

      await expect(service.getCrossCheckSolutionReviews(31, 15)).rejects.toThrow('No historical scores found');
    });
  });

  // -------------------------------------------------------------------------
  // getCheckersWithMaxScore / getCheckersWithoutComments
  // -------------------------------------------------------------------------
  describe('getCheckersWithMaxScore', () => {
    it('maps rows to numeric studentAvgScore and a composite key', async () => {
      const { service, taskSolutionResult } = await buildService();
      const rows = [
        {
          taskName: 'songbird',
          checkerGithubId: 'checker-1',
          studentGithubId: 'student-1',
          studentAverageScoreExcludeChecker: '85.5',
          checkerScore: 100,
        },
      ];
      const qb = makeQb({ getRawMany: rows });
      // The first innerJoin arg is an anonymous sub-query builder function (name === '');
      // entity classes (CourseTask, Task, ...) are named, so we only invoke the anonymous one.
      (qb.innerJoin as ReturnType<typeof vi.fn>).mockImplementation((arg: unknown) => {
        if (typeof arg === 'function' && (arg as { name: string }).name === '') {
          (arg as (q: unknown) => unknown)(makeQb());
        }
        return qb;
      });
      taskSolutionResult.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getCheckersWithMaxScore(42);

      expect(result).toEqual([{ ...rows[0], studentAvgScore: 85.5, key: 'checker-1.student-1.songbird' }]);
    });
  });

  describe('getCheckersWithoutComments', () => {
    it('maps rows to a composite key', async () => {
      const { service, taskSolutionResult } = await buildService();
      const rows = [
        {
          taskName: 'songbird',
          checkerGithubId: 'checker-2',
          studentGithubId: 'student-2',
          checkerScore: 50,
          comment: 'ok',
        },
      ];
      taskSolutionResult.createQueryBuilder.mockReturnValue(makeQb({ getRawMany: rows }));

      const result = await service.getCheckersWithoutComments(42);

      expect(result).toEqual([{ ...rows[0], key: 'checker-2.student-2.songbird' }]);
    });
  });
});
