import { ScoreService } from './score.service';

const primaryUserFields = (modelName: string) => [
  `${modelName}.id`,
  `${modelName}.firstName`,
  `${modelName}.lastName`,
  `${modelName}.githubId`,
  `${modelName}.cityName`,
  `${modelName}.countryName`,
  `${modelName}.discord`,
];

// Fluent query-builder double: every chainable method returns the builder and
// records its arguments; terminal getters resolve the supplied data.
function createFakeQueryBuilder(
  methods: string[],
  terminals: { getMany?: unknown[]; getOne?: unknown; getManyAndCount?: [unknown[], number] },
) {
  const calls: Record<string, unknown[][]> = {};
  const qb: any = {};
  for (const method of methods) {
    qb[method] = vi.fn((...args: unknown[]) => {
      (calls[method] ??= []).push(args);
      return qb;
    });
  }
  qb.getMany = vi.fn(async () => terminals.getMany ?? []);
  qb.getOne = vi.fn(async () => terminals.getOne ?? null);
  qb.getManyAndCount = vi.fn(async () => terminals.getManyAndCount ?? [[], 0]);
  return { qb, calls };
}

const chainMethods = [
  'innerJoin',
  'innerJoinAndSelect',
  'addSelect',
  'leftJoin',
  'where',
  'andWhere',
  'orderBy',
  'take',
  'skip',
];

// A student row shaped for convertToScoreStudentDto + ScoreStudentDto/StudentDto constructors.
const fixtureStudent = {
  id: 1,
  rank: 5,
  totalScore: 80,
  crossCheckScore: 12,
  totalScoreChangeDate: new Date('2024-02-01T00:00:00.000Z'),
  isExpelled: false,
  isFailed: false,
  user: {
    id: 101,
    githubId: 'john-doe',
    firstName: 'John',
    lastName: 'Doe',
    cityName: 'Minsk',
    countryName: 'Belarus',
  },
  mentor: {
    id: 201,
    isExpelled: false,
    students: [],
    user: {
      id: 301,
      githubId: 'mentor-mike',
      firstName: 'Mike',
      lastName: 'Mentor',
      cityName: 'Gomel',
      countryName: 'Belarus',
    },
  },
  taskResults: [
    { courseTaskId: 11, score: 50, courseTask: { id: 11, disabled: false } },
    { courseTaskId: 12, score: 40, courseTask: { id: 12, disabled: true } },
  ],
  taskInterviewResults: [
    { courseTaskId: 13, score: 7, updatedDate: '2024-01-02T00:00:00.000Z' },
    { courseTaskId: 13, score: 9, updatedDate: '2024-01-05T00:00:00.000Z' },
  ],
  stageInterviews: [],
};

function buildService(
  opts: {
    studentTerminals?: Parameters<typeof createFakeQueryBuilder>[1];
    dataSourceTerminals?: Parameters<typeof createFakeQueryBuilder>[1];
  } = {},
) {
  const { qb: studentQb, calls: studentCalls } = createFakeQueryBuilder(chainMethods, opts.studentTerminals ?? {});
  const { qb: dataSourceQb, calls: dataSourceCalls } = createFakeQueryBuilder(
    chainMethods,
    opts.dataSourceTerminals ?? {},
  );

  const studentRepository = { createQueryBuilder: vi.fn(() => studentQb) };
  const taskResultRepository = {};
  const getRepository = vi.fn(() => ({ createQueryBuilder: vi.fn(() => dataSourceQb) }));
  const dataSource = { getRepository };
  const configService = { host: 'https://app.rs.school' };

  const service = new ScoreService(
    studentRepository as never,
    taskResultRepository as never,
    dataSource as never,
    configService as never,
  );

  return { service, studentQb, studentCalls, dataSourceQb, dataSourceCalls, getRepository };
}

describe('ScoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudentForScore', () => {
    it('builds the lookup query by githubId + courseId and returns the single student', async () => {
      const { service, studentCalls } = buildService({ studentTerminals: { getOne: { id: 1 } } });

      const result = await service.getStudentForScore(11, 'john-doe');

      expect(result).toEqual({ id: 1 });
      expect(studentCalls.innerJoin).toEqual([['student.user', 'user']]);
      expect(studentCalls.addSelect).toEqual([[['user.firstName', 'user.lastName', 'user.githubId', 'user.id']]]);
      expect(studentCalls.where).toEqual([['user.githubId = :githubId', { githubId: 'john-doe' }]]);
      expect(studentCalls.andWhere).toEqual([['student.courseId = :courseId', { courseId: 11 }]]);
    });

    it('returns null when no student is found', async () => {
      const { service } = buildService({ studentTerminals: { getOne: null } });

      const result = await service.getStudentForScore(11, 'ghost');

      expect(result).toBeNull();
    });
  });

  describe('getCourseTaskWithCourse', () => {
    it('queries the CourseTask repository joining task and course', async () => {
      const { service, dataSourceCalls, getRepository } = buildService({
        dataSourceTerminals: { getOne: { id: 7 } },
      });

      const result = await service.getCourseTaskWithCourse(7);

      expect(result).toEqual({ id: 7 });
      expect(getRepository).toHaveBeenCalled();
      expect(dataSourceCalls.innerJoinAndSelect).toEqual([
        ['courseTask.task', 'task'],
        ['courseTask.course', 'course'],
      ]);
      expect(dataSourceCalls.where).toEqual([['courseTask.id = :courseTaskId', { courseTaskId: 7 }]]);
    });
  });

  describe('getMentorByUserId', () => {
    it('queries the Mentor repository by userId + courseId', async () => {
      const { service, dataSourceCalls } = buildService({ dataSourceTerminals: { getOne: { id: 8 } } });

      const result = await service.getMentorByUserId(11, 101);

      expect(result).toEqual({ id: 8 });
      expect(dataSourceCalls.where).toEqual([['mentor."userId" = :userId', { userId: 101 }]]);
      expect(dataSourceCalls.andWhere).toEqual([['mentor."courseId" = :courseId', { courseId: 11 }]]);
    });

    it('returns null when no mentor matches', async () => {
      const { service } = buildService({ dataSourceTerminals: { getOne: null } });

      const result = await service.getMentorByUserId(11, 999);

      expect(result).toBeNull();
    });
  });

  describe('getStudentScore', () => {
    it('returns a ScoreStudentDto for the matching student', async () => {
      const { service, studentCalls } = buildService({ studentTerminals: { getOne: fixtureStudent } });

      const result = await service.getStudentScore({ courseId: 11, githubId: 'john-doe' });

      expect(result).not.toBeNull();
      expect(result!.githubId).toBe('john-doe');
      expect(result!.crossCheckScore).toBe(12);
      // the githubId filter is appended on top of the basic query
      expect(studentCalls.andWhere).toContainEqual(['"user"."githubId" = :githubId', { githubId: 'john-doe' }]);
    });

    it('returns null when no student is found', async () => {
      const { service } = buildService({ studentTerminals: { getOne: null } });

      const result = await service.getStudentScore({ courseId: 11, githubId: 'ghost' });

      expect(result).toBeNull();
    });
  });

  describe('getScore', () => {
    it('paginates, maps students to dtos and wraps them in a ScoreDto', async () => {
      const { service, studentQb, studentCalls } = buildService({
        studentTerminals: { getManyAndCount: [[fixtureStudent], 1] },
      });

      const result = await service.getScore({
        filter: {},
        orderBy: { field: 'rank', direction: 'asc' },
        page: 2,
        limit: 10,
        courseId: 11,
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]!.githubId).toBe('john-doe');
      expect(result.pagination).toMatchObject({ current: 2, pageSize: 10, total: 1, totalPages: 1 });
      // paginate applies take(limit) and skip((page-1)*limit)
      expect(studentQb.take).toHaveBeenCalledWith(10);
      expect(studentQb.skip).toHaveBeenCalledWith(10);
      // default order maps 'rank' -> 'student.rank' ASC
      expect(studentCalls.orderBy).toEqual([['student.rank', 'ASC']]);
    });

    it('returns an empty content list when no students match', async () => {
      const { service } = buildService({ studentTerminals: { getManyAndCount: [[], 0] } });

      const result = await service.getScore({
        filter: {},
        orderBy: { field: 'totalScore', direction: 'desc' },
        page: 1,
        limit: 20,
        courseId: 11,
      });

      expect(result.content).toEqual([]);
      expect(result.pagination).toMatchObject({ total: 0, totalPages: 0, itemCount: 0 });
    });

    it('applies all optional filters and the requested ordering', async () => {
      const { service, studentCalls } = buildService({ studentTerminals: { getManyAndCount: [[], 0] } });

      await service.getScore({
        filter: {
          activeOnly: 'true',
          name: 'john',
          cityName: 'Minsk',
          'mentor.githubId': 'mike',
          githubId: 'john-doe',
        },
        orderBy: { field: 'mentor', direction: 'desc' },
        page: 1,
        limit: 10,
        courseId: 11,
      });

      expect(studentCalls.andWhere).toEqual([
        ['student."isFailed" = false'],
        ['student."isExpelled" = false'],
        ['("user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText)', { searchText: '%john%' }],
        ['"user"."cityName" ILIKE :searchCityNameText', { searchCityNameText: '%Minsk%' }],
        ['"mu"."githubId" ILIKE :searchMentorGithubIdText', { searchMentorGithubIdText: '%mike%' }],
        ['("user"."githubId" ILIKE :searchGithubIdText)', { searchGithubIdText: '%john-doe%' }],
      ]);
      // 'mentor' field maps to 'mu.githubId', direction uppercased to DESC
      expect(studentCalls.orderBy).toEqual([['mu.githubId', 'DESC']]);
    });

    it('does not apply optional filters when activeOnly is "false" and no search terms are given', async () => {
      const { service, studentCalls } = buildService({ studentTerminals: { getManyAndCount: [[], 0] } });

      await service.getScore({
        filter: { activeOnly: 'false' },
        orderBy: { field: 'rank', direction: 'asc' },
        page: 1,
        limit: 10,
        courseId: 11,
      });

      // only the base where clause is present; no andWhere filters
      expect(studentCalls.andWhere).toBeUndefined();
    });

    it('uses default filter and default order when none are supplied', async () => {
      const { service, studentCalls } = buildService({ studentTerminals: { getManyAndCount: [[], 0] } });

      await service.getScore({
        // @ts-expect-error exercising the runtime defaults for filter/orderBy
        filter: undefined,
        // @ts-expect-error exercising the runtime defaults for filter/orderBy
        orderBy: undefined,
        page: 1,
        limit: 10,
        courseId: 11,
      });

      // defaultFilter has activeOnly 'false' and empty strings -> no andWhere filters
      expect(studentCalls.andWhere).toBeUndefined();
      // defaultOrder is rank/asc
      expect(studentCalls.orderBy).toEqual([['student.rank', 'ASC']]);
    });
  });

  describe('convertToScoreStudentDto (via getStudentScore)', () => {
    it('excludes disabled task results and keeps only the latest interview per courseTask', async () => {
      const { service } = buildService({ studentTerminals: { getOne: fixtureStudent } });

      const result = await service.getStudentScore({ courseId: 11, githubId: 'john-doe' });

      const taskResults = result!.taskResults;
      // disabled courseTaskId 12 dropped; courseTaskId 11 kept; latest interview (score 9) for 13 kept
      expect(taskResults).toContainEqual({ courseTaskId: 11, score: 50 });
      expect(taskResults).not.toContainEqual(expect.objectContaining({ courseTaskId: 12 }));
      expect(taskResults).toContainEqual({ courseTaskId: 13, score: 9 });
    });

    it('builds a mentor basic object when a mentor is present', async () => {
      const { service } = buildService({ studentTerminals: { getOne: fixtureStudent } });

      const result = await service.getStudentScore({ courseId: 11, githubId: 'john-doe' });

      expect(result!.mentor).toMatchObject({ id: 201, githubId: 'mentor-mike', name: 'Mike Mentor' });
    });

    it('leaves mentor undefined when student has no mentor and defaults null collections', async () => {
      const studentNoMentor = {
        ...fixtureStudent,
        mentor: null,
        taskResults: null,
        taskInterviewResults: null,
        stageInterviews: null,
      };
      const { service } = buildService({ studentTerminals: { getOne: studentNoMentor } });

      const result = await service.getStudentScore({ courseId: 11, githubId: 'john-doe' });

      expect(result!.mentor).toBeUndefined();
      expect(result!.taskResults).toEqual([]);
    });

    it('appends the pre-screening interview score as a task result when not already present', async () => {
      const studentWithStageInterview = {
        ...fixtureStudent,
        taskResults: [],
        taskInterviewResults: [],
        stageInterviews: [
          {
            id: 31,
            courseTaskId: 14,
            isCompleted: true,
            score: 65,
            stageInterviewFeedbacks: [{ json: '{}', updatedDate: '2024-01-03T00:00:00.000Z', version: 1 }],
          },
        ],
      };
      const { service } = buildService({ studentTerminals: { getOne: studentWithStageInterview } });

      const result = await service.getStudentScore({ courseId: 11, githubId: 'john-doe' });

      // floor(65) pushed under its courseTaskId
      expect(result!.taskResults).toContainEqual({ courseTaskId: 14, score: 65 });
    });

    it('does not duplicate the pre-screening score when a task result for that courseTask already exists', async () => {
      const studentWithStageInterview = {
        ...fixtureStudent,
        taskResults: [{ courseTaskId: 14, score: 99, courseTask: { id: 14, disabled: false } }],
        taskInterviewResults: [],
        stageInterviews: [
          {
            id: 31,
            courseTaskId: 14,
            isCompleted: true,
            score: 65,
            stageInterviewFeedbacks: [{ json: '{}', updatedDate: '2024-01-03T00:00:00.000Z', version: 1 }],
          },
        ],
      };
      const { service } = buildService({ studentTerminals: { getOne: studentWithStageInterview } });

      const result = await service.getStudentScore({ courseId: 11, githubId: 'john-doe' });

      const courseTask14Results = result!.taskResults.filter(t => t.courseTaskId === 14);
      expect(courseTask14Results).toEqual([{ courseTaskId: 14, score: 99 }]);
    });

    it('marks isActive false when the student is expelled', async () => {
      const expelledStudent = { ...fixtureStudent, isExpelled: true };
      const { service } = buildService({ studentTerminals: { getOne: expelledStudent } });

      const result = await service.getStudentScore({ courseId: 11, githubId: 'john-doe' });

      expect(result!.isActive).toBe(false);
    });
  });

  describe('getStudentsScoreForExport (activeOnly branch)', () => {
    it('adds the isFailed/isExpelled filters when activeOnly is true', async () => {
      const { service, studentCalls } = buildService({
        studentTerminals: { getMany: [] },
        dataSourceTerminals: { getMany: [] },
      });

      await service.getStudentsScoreForExport(
        11,
        { activeOnly: true },
        { includeContacts: false, includeCertificate: false },
      );

      expect(studentCalls.andWhere).toEqual([['student."isFailed" = false'], ['student."isExpelled" = false']]);
    });

    it('defaults null collections/country and an unnamed mentor when mapping export rows', async () => {
      const sparseStudent = {
        id: 9,
        rank: 1,
        totalScore: 0,
        isExpelled: false,
        isFailed: false,
        user: {
          id: 900,
          githubId: 'sparse',
          firstName: 'Sparse',
          lastName: 'Student',
          cityName: null,
          countryName: null, // -> 'Other'
          resume: undefined,
        },
        // unnamed mentor user -> buildExportName returns ''
        mentor: { id: 1, userId: 2, user: { id: 2, githubId: 'm', firstName: null, lastName: null } },
        taskResults: null, // -> [] branch
        taskInterviewResults: null, // -> [] branch
        stageInterviews: null, // -> [] branch
      };
      const { service } = buildService({
        studentTerminals: { getMany: [sparseStudent] },
        dataSourceTerminals: { getMany: [] },
      });

      const rows = await service.getStudentsScoreForExport(
        11,
        { activeOnly: false },
        { includeContacts: false, includeCertificate: false },
      );

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        githubId: 'sparse',
        name: 'Sparse Student',
        countryName: 'Other',
        locationName: '',
        mentorGithubId: 'm',
      });
    });
  });

  describe('buildBasicScoreQuery field selection', () => {
    it('selects primary user fields for both student user and mentor user', async () => {
      const { service, studentCalls } = buildService({ studentTerminals: { getOne: null } });

      await service.getStudentScore({ courseId: 11, githubId: 'john-doe' });

      expect(studentCalls.addSelect).toContainEqual([primaryUserFields('user')]);
      expect(studentCalls.addSelect).toContainEqual([primaryUserFields('mu')]);
    });
  });
});
