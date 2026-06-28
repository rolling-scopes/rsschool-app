import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Between, DataSource, In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';
import { Checker, CourseTask, CrossCheckStatus } from '@entities/courseTask';
import { TaskSolution } from '@entities/taskSolution';
import { CourseTasksService, Status } from './course-tasks.service';
import { CrossMentorDistributionService } from '../interviews/cross-mentor-distribution.service';

// Fluent query-builder mock helper: every chainable method returns the qb,
// while getRawMany/getMany resolve the supplied rows.
function queryBuilderReturning(rawRows: unknown[] = [], rows: unknown[] = []) {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of ['select', 'addSelect', 'leftJoin', 'where', 'andWhere', 'groupBy']) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getRawMany = vi.fn(async () => rawRows);
  qb.getMany = vi.fn(async () => rows);
  return qb;
}

const courseTaskRepository = {
  find: vi.fn(),
  findOneOrFail: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  createQueryBuilder: vi.fn(),
};
const taskSolutionRepository = { findBy: vi.fn() };

describe('CourseTasksService', () => {
  let service: CourseTasksService;

  beforeEach(async () => {
    Object.values(courseTaskRepository).forEach(fn => fn.mockReset());
    Object.values(taskSolutionRepository).forEach(fn => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseTasksService,
        { provide: getRepositoryToken(CourseTask), useValue: courseTaskRepository },
        { provide: getRepositoryToken(TaskSolution), useValue: taskSolutionRepository },
        { provide: DataSource, useValue: {} },
        { provide: CrossMentorDistributionService, useValue: {} },
      ],
    }).compile();

    service = module.get(CourseTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('queries non-disabled tasks for a course with default options (no status, no cache, no checker)', async () => {
      courseTaskRepository.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.getAll(5);

      expect(courseTaskRepository.find).toHaveBeenCalledWith({
        where: { courseId: 5, disabled: false, checker: undefined },
        relations: ['task', 'taskOwner'],
        order: { studentEndDate: 'ASC', studentStartDate: 'ASC' },
        cache: undefined,
      });
      expect(result).toEqual([{ id: 1 }]);
    });

    it('applies the started status condition', async () => {
      courseTaskRepository.find.mockResolvedValue([]);

      await service.getAll(5, Status.Started);

      const where = courseTaskRepository.find.mock.calls[0][0].where;
      expect(where.studentStartDate).toEqual(LessThanOrEqual(expect.any(String)));
      expect(where.studentEndDate).toBeUndefined();
    });

    it('applies the inprogress status condition (start passed, end in future)', async () => {
      courseTaskRepository.find.mockResolvedValue([]);

      await service.getAll(5, Status.InProgress);

      const where = courseTaskRepository.find.mock.calls[0][0].where;
      expect(where.studentStartDate).toEqual(LessThanOrEqual(expect.any(String)));
      expect(where.studentEndDate).toEqual(MoreThan(expect.any(String)));
    });

    it('applies the finished status condition', async () => {
      courseTaskRepository.find.mockResolvedValue([]);

      await service.getAll(5, Status.Finished);

      const where = courseTaskRepository.find.mock.calls[0][0].where;
      expect(where.studentEndDate).toEqual(LessThan(expect.any(String)));
      expect(where.studentStartDate).toBeUndefined();
    });

    it('enables a 60s cache when useCache is true', async () => {
      courseTaskRepository.find.mockResolvedValue([]);

      await service.getAll(5, undefined, true);

      expect(courseTaskRepository.find.mock.calls[0][0].cache).toBe(60 * 1000);
    });

    it('passes a checker filter through', async () => {
      courseTaskRepository.find.mockResolvedValue([]);

      await service.getAll(5, undefined, false, Checker.AutoTest);

      expect(courseTaskRepository.find.mock.calls[0][0].where.checker).toBe(Checker.AutoTest);
    });
  });

  describe('getAllWithStudentSolution', () => {
    it('attaches matching solutions to their course tasks and leaves others untouched', async () => {
      const courseTasks = [{ id: 1 }, { id: 2 }];
      courseTaskRepository.find.mockResolvedValue(courseTasks);
      const solution = { id: 99, courseTaskId: 1, studentId: 50 };
      taskSolutionRepository.findBy.mockResolvedValue([solution]);

      const result = await service.getAllWithStudentSolution(5, 50, Status.Started, true);

      expect(taskSolutionRepository.findBy).toHaveBeenCalledWith({
        courseTaskId: In([1, 2]),
        studentId: 50,
      });
      expect(result[0]).toEqual({ id: 1, taskSolutions: [solution] });
      expect(result[1]).toEqual({ id: 2 });
    });

    it('returns tasks without taskSolutions when student has no solutions', async () => {
      courseTaskRepository.find.mockResolvedValue([{ id: 1 }]);
      taskSolutionRepository.findBy.mockResolvedValue([]);

      const result = await service.getAllWithStudentSolution(5, 50);

      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getAllDetailed', () => {
    it('merges result counts into course tasks, coercing strings and missing values to numbers', async () => {
      courseTaskRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      courseTaskRepository.createQueryBuilder.mockReturnValue(
        queryBuilderReturning([
          { id: 1, resultsCount: '4', interviewResultsCount: '2', stageInterviewResultsCount: '1' },
        ]),
      );

      const result = await service.getAllDetailed(5);

      // task 1 has matching aggregate row
      expect(result[0]).toMatchObject({
        id: 1,
        resultsCount: 4,
        interviewResultsCount: 2,
        stageInterviewResultsCount: 1,
      });
      // task 2 has no aggregate row -> all counts default to 0
      expect(result[1]).toMatchObject({
        id: 2,
        resultsCount: 0,
        interviewResultsCount: 0,
        stageInterviewResultsCount: 0,
      });
    });

    it('defaults counts to 0 when aggregate values are null/undefined', async () => {
      courseTaskRepository.find.mockResolvedValue([{ id: 1 }]);
      courseTaskRepository.createQueryBuilder.mockReturnValue(
        queryBuilderReturning([
          { id: 1, resultsCount: null, interviewResultsCount: undefined, stageInterviewResultsCount: null },
        ]),
      );

      const result = await service.getAllDetailed(5);

      expect(result[0]).toMatchObject({
        resultsCount: 0,
        interviewResultsCount: 0,
        stageInterviewResultsCount: 0,
      });
    });
  });

  describe('getById', () => {
    it('loads a single course task with its task relation, failing if missing', async () => {
      const task = { id: 7 };
      courseTaskRepository.findOneOrFail.mockResolvedValue(task);

      const result = await service.getById(7);

      expect(courseTaskRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 7 },
        relations: ['task'],
      });
      expect(result).toBe(task);
    });
  });

  describe('getByOwner', () => {
    it('builds a query for task-owner-checked tasks of the given github user', async () => {
      const qb = queryBuilderReturning([], [{ id: 1 }]);
      courseTaskRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getByOwner('johndoe');

      expect(qb.where).toHaveBeenCalledWith('t.checker = :checker', { checker: Checker.TaskOwner });
      expect(qb.andWhere).toHaveBeenCalledWith('u.githubId = :username', { username: 'johndoe' });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getUpdatedTasks', () => {
    it('finds tasks updated within the last N hours', async () => {
      courseTaskRepository.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.getUpdatedTasks(5, 3);

      const args = courseTaskRepository.find.mock.calls[0][0];
      expect(args.where.courseId).toBe(5);
      expect(args.where.updatedDate).toEqual(MoreThanOrEqual(expect.any(String)));
      expect(args.relations).toEqual(['task']);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getTasksPendingDeadline', () => {
    it('uses default deadline window and safe buffer', async () => {
      courseTaskRepository.find.mockResolvedValue([]);

      await service.getTasksPendingDeadline(5);

      const where = courseTaskRepository.find.mock.calls[0][0].where;
      expect(where).toMatchObject({ courseId: 5, disabled: false });
      expect(where.studentStartDate).toEqual(LessThanOrEqual(expect.any(String)));
      expect(where.studentEndDate).toEqual(Between(expect.any(String), expect.any(String)));
      expect(courseTaskRepository.find.mock.calls[0][0].relations).toEqual(['task', 'taskSolutions']);
      expect(courseTaskRepository.find.mock.calls[0][0].order).toEqual({ studentEndDate: 'ASC' });
    });

    it('honours custom deadlineWithinHours and safeBuffer options', async () => {
      courseTaskRepository.find.mockResolvedValue([]);

      await service.getTasksPendingDeadline(5, { deadlineWithinHours: 48, safeBuffer: 2 });

      const where = courseTaskRepository.find.mock.calls[0][0].where;
      expect(where.studentEndDate).toEqual(Between(expect.any(String), expect.any(String)));
    });
  });

  describe('createCourseTask', () => {
    it('inserts the course task', async () => {
      const payload = { courseId: 5, taskId: 1 };
      courseTaskRepository.insert.mockResolvedValue({ identifiers: [{ id: 1 }] });

      const result = await service.createCourseTask(payload);

      expect(courseTaskRepository.insert).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ identifiers: [{ id: 1 }] });
    });
  });

  describe('updateCourseTask', () => {
    it('updates the course task by id', async () => {
      courseTaskRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateCourseTask(7, { maxScore: 100 });

      expect(courseTaskRepository.update).toHaveBeenCalledWith(7, { maxScore: 100 });
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('disable', () => {
    it('soft-disables the task while passing the id through for subscription handling', async () => {
      courseTaskRepository.update.mockResolvedValue({ affected: 1 });

      await service.disable(7);

      expect(courseTaskRepository.update).toHaveBeenCalledWith(7, { id: 7, disabled: true });
    });
  });

  describe('changeCourseTaskProcessing', () => {
    it.each([true, false])('updates the isCreatingInterviewPairs flag to %s', async flag => {
      courseTaskRepository.update.mockResolvedValue({ affected: 1 });

      await service.changeCourseTaskProcessing(7, flag);

      expect(courseTaskRepository.update).toHaveBeenCalledWith(7, { isCreatingInterviewPairs: flag });
    });
  });

  describe('getAvailableCrossChecks', () => {
    it('finds distributed cross-check tasks selecting only id and task name', async () => {
      courseTaskRepository.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.getAvailableCrossChecks(5);

      expect(courseTaskRepository.find).toHaveBeenCalledWith({
        where: {
          courseId: 5,
          checker: Checker.CrossCheck,
          crossCheckStatus: CrossCheckStatus.Distributed,
          disabled: false,
        },
        relations: { task: true },
        select: { id: true, task: { name: true } },
      });
      expect(result).toEqual([{ id: 1 }]);
    });
  });
});
