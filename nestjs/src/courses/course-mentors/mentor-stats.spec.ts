import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CourseTask, Mentor, TaskResult } from '@entities/index';
import { CourseMentorsService } from './course-mentors.service';

// Builds a fluent query-builder mock. Every method in `chain` returns the builder;
// the keys of `terminals` map terminal method names to (async) resolved values, and
// getQuery/getParameters are provided so sub-queries can be embedded.
function makeQb(terminals: Record<string, unknown> = {}, options: { query?: string; params?: object } = {}) {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  const chainMethods = [
    'select',
    'addSelect',
    'leftJoin',
    'innerJoin',
    'from',
    'where',
    'andWhere',
    'orderBy',
    'groupBy',
    'limit',
    'setParameters',
  ];
  for (const m of chainMethods) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getQuery = vi.fn(() => options.query ?? 'SUBQUERY');
  qb.getParameters = vi.fn(() => options.params ?? {});
  for (const [method, value] of Object.entries(terminals)) {
    qb[method] = vi.fn(async () => value);
  }
  return qb;
}

describe('CourseMentorsService stats & search', () => {
  let service: CourseMentorsService;
  let mentorsRepository: Mocked<Repository<Mentor>>;
  let courseTaskRepository: Mocked<Repository<CourseTask>>;
  let taskResultRepository: Mocked<Repository<TaskResult>>;
  let dataSource: { createQueryBuilder: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dataSource = { createQueryBuilder: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseMentorsService,
        { provide: getRepositoryToken(Mentor), useValue: { createQueryBuilder: vi.fn() } },
        { provide: getRepositoryToken(CourseTask), useValue: { createQueryBuilder: vi.fn() } },
        { provide: getRepositoryToken(TaskResult), useValue: { createQueryBuilder: vi.fn() } },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(CourseMentorsService);
    mentorsRepository = module.get(getRepositoryToken(Mentor));
    courseTaskRepository = module.get(getRepositoryToken(CourseTask));
    taskResultRepository = module.get(getRepositoryToken(TaskResult));
  });

  describe('getMentorsWithStats', () => {
    // Wires up the four collaborating queries used by getMentorsWithStats:
    //  - courseTaskRepository -> getManyAndCount (mentor-checker task ids + total task count)
    //  - mentorsRepository    -> getMany (mentor records with relations)
    //  - taskResultRepository -> sub-query builder (embedded twice)
    //  - dataSource           -> getRawMany (checked count, then last checked dates)
    const setup = (opts: {
      tasks: { id: number }[];
      tasksCount: number;
      mentors: unknown[];
      checkedCount: { id: number; value: string }[];
      lastChecked: { id: number; value: Date | null }[];
    }) => {
      courseTaskRepository.createQueryBuilder.mockReturnValue(
        makeQb({ getManyAndCount: [opts.tasks, opts.tasksCount] }) as never,
      );
      mentorsRepository.createQueryBuilder.mockReturnValue(makeQb({ getMany: opts.mentors }) as never);
      taskResultRepository.createQueryBuilder.mockReturnValue(makeQb() as never);
      // first dataSource query = checked counts, second = last checked dates
      dataSource.createQueryBuilder
        .mockReturnValueOnce(makeQb({ getRawMany: opts.checkedCount }))
        .mockReturnValueOnce(makeQb({ getRawMany: opts.lastChecked }));
    };

    const buildMentor = (overrides: Record<string, unknown> = {}) => ({
      id: 7,
      isExpelled: false,
      maxStudentsLimit: 5,
      studentsPreference: 'any',
      user: {
        githubId: 'john-doe',
        firstName: 'John',
        lastName: 'Doe',
        cityName: 'Minsk',
        countryName: 'Belarus',
        contactsEmail: 'john@mail.com',
        contactsEpamEmail: 'john@epam.com',
      },
      students: [
        { id: 1, isExpelled: false, isFailed: false },
        { id: 2, isExpelled: true, isFailed: false },
        { id: 3, isExpelled: false, isFailed: true },
      ],
      stageInterviews: [
        { id: 10, isCompleted: true },
        { id: 11, isCompleted: false },
      ],
      taskChecker: [
        { id: 20, courseTask: { type: 'interview' } },
        { id: 21, courseTask: { type: 'codewars' } },
      ],
      interviewResults: [{ id: 30 }],
      ...overrides,
    });

    it('filters mentor-checker tasks: not interview, end date passed, not disabled', async () => {
      setup({
        tasks: [{ id: 100 }, { id: 101 }],
        tasksCount: 2,
        mentors: [],
        checkedCount: [],
        lastChecked: [],
      });

      await service.getMentorsWithStats(5);

      const ctQb = courseTaskRepository.createQueryBuilder.mock.results[0].value;
      expect(courseTaskRepository.createQueryBuilder).toHaveBeenCalledWith('c');
      expect(ctQb.where).toHaveBeenCalledWith({ checker: 'mentor', courseId: 5, disabled: false });
      expect(ctQb.andWhere).toHaveBeenCalledWith('c.studentEndDate < NOW()');
      expect(ctQb.andWhere).toHaveBeenCalledWith("c.type <> 'interview'");
    });

    it('aggregates per-mentor stats: active students, screenings, interviews, task results', async () => {
      setup({
        tasks: [{ id: 100 }, { id: 101 }],
        tasksCount: 2,
        mentors: [buildMentor()],
        checkedCount: [{ id: 7, value: '4' }],
        lastChecked: [{ id: 7, value: new Date('2024-05-01T00:00:00.000Z') }],
      });

      const [mentor] = await service.getMentorsWithStats(5);

      expect(mentor).toMatchObject({
        id: 7,
        contactsEmail: 'john@mail.com',
        contactsEpamEmail: 'john@epam.com',
        // only student 1 is active (2 expelled, 3 failed)
        studentsCount: 1,
        screenings: { total: 2, completed: 1 },
        // only the interview-type task checker counts towards interviews.total
        interviews: { total: 1, completed: 1 },
        taskResultsStats: {
          // 1 active student * 2 tasks
          total: 2,
          checked: 4,
        },
      });
      expect(mentor.taskResultsStats?.lastUpdatedDate).toEqual(new Date('2024-05-01T00:00:00.000Z'));
    });

    it('defaults missing checked count to 0 and null last-checked date', async () => {
      setup({
        tasks: [],
        tasksCount: 0,
        mentors: [buildMentor()],
        checkedCount: [], // no entry for mentor 7
        lastChecked: [], // no entry for mentor 7
      });

      const [mentor] = await service.getMentorsWithStats(5);

      expect(mentor.taskResultsStats).toMatchObject({
        total: 0, // 1 active student * 0 tasks
        checked: 0,
        lastUpdatedDate: null,
      });
    });

    it('handles null/empty relation fields without throwing', async () => {
      setup({
        tasks: [{ id: 100 }],
        tasksCount: 1,
        mentors: [
          buildMentor({
            user: {
              githubId: 'jane',
              firstName: 'Jane',
              lastName: 'Roe',
              cityName: null,
              countryName: null,
              contactsEmail: null,
              contactsEpamEmail: null,
            },
            students: null,
            stageInterviews: null,
            taskChecker: null,
            interviewResults: null,
          }),
        ],
        checkedCount: [],
        lastChecked: [],
      });

      const [mentor] = await service.getMentorsWithStats(5);

      expect(mentor).toMatchObject({
        contactsEmail: '',
        contactsEpamEmail: '',
        studentsCount: 0,
        screenings: { total: 0, completed: 0 },
        interviews: { total: undefined, completed: 0 },
        taskResultsStats: { total: 0, checked: 0, lastUpdatedDate: null },
      });
    });

    it('returns an empty array when there are no mentors', async () => {
      setup({ tasks: [{ id: 1 }], tasksCount: 1, mentors: [], checkedCount: [], lastChecked: [] });

      const result = await service.getMentorsWithStats(5);

      expect(result).toEqual([]);
    });

    it('passes mentor-checker task ids (plus the 0 sentinel) into the task-result sub-query', async () => {
      setup({
        tasks: [{ id: 100 }, { id: 101 }],
        tasksCount: 2,
        mentors: [],
        checkedCount: [],
        lastChecked: [],
      });

      await service.getMentorsWithStats(5);

      // buildTaskResultSubQuery is invoked twice (checked count + last checked dates),
      // each appending a 0 to preserve a non-empty IN (...) list.
      const subQb = taskResultRepository.createQueryBuilder.mock.results[0].value;
      expect(subQb.where).toHaveBeenCalledWith('t.courseTaskId IN (:...ids)', { ids: [100, 101, 0] });
    });
  });

  describe('searchMentors', () => {
    const setupSearch = (rows: unknown[]) => {
      const qb = makeQb({ getMany: rows });
      mentorsRepository.createQueryBuilder.mockReturnValue(qb as never);
      return qb;
    };

    it('builds an ILIKE search across githubId / first / last / full name, scoped to non-expelled mentors, limit 20', async () => {
      const qb = setupSearch([{ id: 1, user: { id: 11, githubId: 'john-doe', firstName: 'John', lastName: 'Doe' } }]);

      const result = await service.searchMentors(5, '%john%');

      expect(mentorsRepository.createQueryBuilder).toHaveBeenCalledWith('mentor');
      expect(qb.where).toHaveBeenCalledWith('"mentor"."courseId" = :courseId', { courseId: 5 });
      expect(qb.andWhere).toHaveBeenCalledWith('"mentor"."isExpelled" = false');
      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('ILIKE :searchText'), {
        courseId: 5,
        searchText: '%john%',
      });
      expect(qb.limit).toHaveBeenCalledWith(20);

      expect(result).toEqual([{ id: 1, githubId: 'john-doe', name: 'John Doe' }]);
    });

    it('builds the (Empty) name for a user without first/last name', async () => {
      setupSearch([{ id: 2, user: { id: 12, githubId: 'no-name', firstName: null, lastName: null } }]);

      const result = await service.searchMentors(5, '%no%');

      expect(result).toEqual([{ id: 2, githubId: 'no-name', name: '(Empty)' }]);
    });

    it('returns an empty array when nothing matches', async () => {
      setupSearch([]);

      const result = await service.searchMentors(5, '%zzz%');

      expect(result).toEqual([]);
    });
  });
});
