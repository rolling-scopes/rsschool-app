import { Test, TestingModule } from '@nestjs/testing';
import {
  CourseScheduleDataSource,
  CourseScheduleItemStatus,
  CourseScheduleItemTag,
  CourseScheduleService,
} from './course-schedule.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import {
  CourseEvent,
  CourseTask,
  StageInterview,
  TaskChecker,
  TaskInterviewResult,
  TaskResult,
  TaskSolution,
  TeamDistribution,
  TeamDistributionStudent,
} from '@entities/index';
import { Checker } from '@entities/courseTask';
import { EventType } from '../course-events/dto/course-event.dto';

const MOCK_CURRENT_TIME = new Date('2022-03-22T00:00:00.000Z');

enum MockDate {
  DateBefore = '2022-03-21T00:00:00.000Z',
  DateAfter = '2022-03-23T00:00:00.000Z',
}

const mockCrossCheckCourseTask = {
  id: 111,
  createdDate: '2022-10-29T15:28:29.054Z',
  updatedDate: '2022-11-01T14:33:47.015Z',
  taskId: 222,
  courseId: 333,
  studentStartDate: '2022-10-27T17:27:00.000Z',
  studentEndDate: '2022-10-31T17:28:00.000Z',
  crossCheckEndDate: '2022-11-05T23:59:00.000Z',
  mentorStartDate: null,
  mentorEndDate: null,
  maxScore: 100,
  scoreWeight: 1,
  checker: 'crossCheck',
  taskOwnerId: 999,
  pairsCount: 3,
  type: 'jstask',
  disabled: false,
  crossCheckStatus: 'initial',
  submitText: 'Some text',
  validations: { githubIdInUrl: false },
  task: {
    id: 222,
    createdDate: ' 2020-02-21T10:24:38.588Z',
    updatedDate: '2020-02-21T10:24:38.588Z',
    name: 'Singolo',
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/singolo',
    description: null,
    githubPrRequired: false,
    verification: 'manual',
    githubRepoName: null,
    sourceGithubRepoUrl: null,
    type: 'htmltask',
    useJury: false,
    allowStudentArtefacts: false,
    tags: ['stage1', 'html'],
    skills: [],
    disciplineId: null,
    attributes: {},
  },
  taskOwner: {
    id: 98765,
    firstName: 'John',
    lastName: 'Doe',
    githubId: 'john-doe',
  },
} as unknown as CourseTask;

describe('CourseScheduleService', () => {
  let service: CourseScheduleService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseScheduleService,
        {
          provide: getRepositoryToken(Course),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CourseTask),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CourseEvent),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaskResult),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaskInterviewResult),
          useValue: {},
        },
        {
          provide: getRepositoryToken(StageInterview),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaskSolution),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaskChecker),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TeamDistributionStudent),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TeamDistribution),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CourseScheduleService>(CourseScheduleService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have getCrossCheckItemStatus method', () => {
    expect(service).toHaveProperty('getCrossCheckItemStatus');
  });

  it('should have transformCrossCheckTask method', () => {
    expect(service).toHaveProperty('transformCrossCheckTask');
  });

  describe('transformCrossCheckTask', () => {
    afterAll(() => {
      vi.restoreAllMocks();
    });
    it('should create 2 items from task', () => {
      const mockStatus = CourseScheduleItemStatus.Available;
      vi.spyOn(service, 'getCrossCheckItemStatus').mockReturnValue(mockStatus);
      const [submitItem, reviewItem] = service.transformCrossCheckTask(mockCrossCheckCourseTask, true, null, 12345);

      expect(submitItem).toEqual({
        id: mockCrossCheckCourseTask.id,
        name: mockCrossCheckCourseTask.task.name,
        courseId: mockCrossCheckCourseTask.courseId,
        startDate: mockCrossCheckCourseTask.studentStartDate,
        endDate: mockCrossCheckCourseTask.studentEndDate,
        status: mockStatus,
        tag: CourseScheduleItemTag.CrossCheckSubmit,
        descriptionUrl: mockCrossCheckCourseTask.task.descriptionUrl,
        organizer: {
          githubId: mockCrossCheckCourseTask.taskOwner?.githubId,
          id: mockCrossCheckCourseTask.taskOwner?.id,
          name: `${mockCrossCheckCourseTask.taskOwner?.firstName} ${mockCrossCheckCourseTask.taskOwner?.lastName}`,
        },
        scoreWeight: mockCrossCheckCourseTask.scoreWeight,
        score: null,
        maxScore: mockCrossCheckCourseTask.maxScore,
        type: CourseScheduleDataSource.CourseTask,
      });

      expect(reviewItem).toEqual({
        id: mockCrossCheckCourseTask.id,
        name: mockCrossCheckCourseTask.task.name,
        courseId: mockCrossCheckCourseTask.courseId,
        startDate: mockCrossCheckCourseTask.studentEndDate,
        endDate: mockCrossCheckCourseTask.crossCheckEndDate,
        status: mockStatus,
        tag: CourseScheduleItemTag.CrossCheckReview,
        descriptionUrl: mockCrossCheckCourseTask.task.descriptionUrl,
        organizer: {
          githubId: mockCrossCheckCourseTask.taskOwner?.githubId,
          id: mockCrossCheckCourseTask.taskOwner?.id,
          name: `${mockCrossCheckCourseTask.taskOwner?.firstName} ${mockCrossCheckCourseTask.taskOwner?.lastName}`,
        },
        scoreWeight: mockCrossCheckCourseTask.scoreWeight,
        score: null,
        maxScore: mockCrossCheckCourseTask.maxScore,
      });
    });
  });

  describe('getCrossCheckItemStatus', () => {
    beforeAll(() => {
      vi.useFakeTimers().setSystemTime(MOCK_CURRENT_TIME);
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    const testCases = [
      {
        description: 'should define item as Archived if no startTime is provided',
        input: [
          {
            startTime: null,
            endTime: MockDate.DateAfter,
          },
          CourseScheduleItemTag.CrossCheckSubmit,
          undefined,
        ],
        expectedStatus: CourseScheduleItemStatus.Archived,
      },
      {
        description: 'should define item as Archived if no endTime is provided',
        input: [
          {
            startTime: MockDate.DateAfter,
            endTime: null,
          },
          CourseScheduleItemTag.CrossCheckSubmit,
          undefined,
        ],
        expectedStatus: CourseScheduleItemStatus.Archived,
      },
      {
        description: 'should define item as Future',
        input: [
          {
            startTime: MockDate.DateAfter,
            endTime: MockDate.DateAfter,
          },
          CourseScheduleItemTag.CrossCheckSubmit,
          undefined,
        ],
        expectedStatus: CourseScheduleItemStatus.Future,
      },
      {
        description: 'should define review item as Done if score is present',
        input: [
          {
            startTime: MockDate.DateBefore,
            endTime: MockDate.DateBefore,
          },
          CourseScheduleItemTag.CrossCheckReview,
          { currentScore: 100 },
        ],
        expectedStatus: CourseScheduleItemStatus.Done,
      },
      {
        description: 'should define submit item as Done if score is present',
        input: [
          {
            startTime: MockDate.DateBefore,
            endTime: MockDate.DateBefore,
          },
          CourseScheduleItemTag.CrossCheckSubmit,
          { currentScore: 100 },
        ],
        expectedStatus: CourseScheduleItemStatus.Done,
      },
      {
        description: 'should define submit item as Done if score is not present but task was submitted',
        input: [
          {
            startTime: MockDate.DateBefore,
            endTime: MockDate.DateBefore,
          },
          CourseScheduleItemTag.CrossCheckSubmit,
          { currentScore: null, submitted: true },
        ],
        expectedStatus: CourseScheduleItemStatus.Done,
      },
      {
        description: 'should define item as Available if task is in progress',
        input: [
          {
            startTime: MockDate.DateBefore,
            endTime: MockDate.DateAfter,
          },
          CourseScheduleItemTag.CrossCheckSubmit,
          { currentScore: null, submitted: true },
        ],
        expectedStatus: CourseScheduleItemStatus.Available,
      },
      {
        description: 'should define review item as Missed if there is no score after submit',
        input: [
          {
            startTime: MockDate.DateBefore,
            endTime: MockDate.DateBefore,
          },
          CourseScheduleItemTag.CrossCheckReview,
          { currentScore: null, submitted: true },
        ],
        expectedStatus: CourseScheduleItemStatus.Missed,
      },
      {
        description: 'should define submit item as Missed if there is no score after submit and there was no submit',
        input: [
          {
            startTime: MockDate.DateBefore,
            endTime: MockDate.DateBefore,
          },
          CourseScheduleItemTag.CrossCheckSubmit,
          { currentScore: null, submitted: false },
        ],
        expectedStatus: CourseScheduleItemStatus.Missed,
      },
    ] as {
      description: string;
      input: [
        { startTime: string | Date | null; endTime: string | Date | null },
        CourseScheduleItemTag,
        { currentScore: number | null; submitted: boolean } | undefined,
      ];
      expectedStatus: CourseScheduleItemStatus;
    }[];

    test.each(testCases)('$description', ({ input: [range, tag, studentData], expectedStatus }) => {
      expect(service.getCrossCheckItemStatus(range, tag, studentData)).toBe(expectedStatus);
    });
  });
});

// --- Branch-coverage suite built around a service wired with mock repositories. ---
// The constructor positional order is mirrored exactly so the typed handles below
// line up with the right TypeORM repository.
type RepoMock = {
  find: ReturnType<typeof vi.fn>;
  findOneByOrFail: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
};

function makeRepo(): RepoMock {
  return { find: vi.fn(), findOneByOrFail: vi.fn(), save: vi.fn() };
}

function buildService() {
  const courseRepository = makeRepo();
  const courseTaskRepository = makeRepo();
  const courseEventRepository = makeRepo();
  const teamDistribution = makeRepo();
  const taskResultRepository = makeRepo();
  const taskInterviewResultRepository = makeRepo();
  const stageInterviewRepository = makeRepo();
  const taskSolutionRepository = makeRepo();
  const taskCheckerRepository = makeRepo();
  const courseTeamDistributionRepository = makeRepo();
  const teamDistributionStudentRepository = makeRepo();

  const service = new CourseScheduleService(
    courseRepository as never,
    courseTaskRepository as never,
    courseEventRepository as never,
    teamDistribution as never,
    taskResultRepository as never,
    taskInterviewResultRepository as never,
    stageInterviewRepository as never,
    taskSolutionRepository as never,
    taskCheckerRepository as never,
    courseTeamDistributionRepository as never,
    teamDistributionStudentRepository as never,
  );

  return {
    service,
    courseRepository,
    courseTaskRepository,
    courseEventRepository,
    teamDistribution,
    taskResultRepository,
    taskInterviewResultRepository,
    stageInterviewRepository,
    taskSolutionRepository,
    taskCheckerRepository,
    courseTeamDistributionRepository,
    teamDistributionStudentRepository,
  };
}

const NOW = new Date('2022-03-22T00:00:00.000Z');
const PAST = new Date('2022-03-20T00:00:00.000Z');
const FUTURE = new Date('2022-03-24T00:00:00.000Z');

describe('CourseScheduleService (branch coverage)', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getCourseTaskSubmitted', () => {
    it('returns true when a task solution matches the course task', () => {
      const { service } = buildService();
      const result = service.getCourseTaskSubmitted(5, [{ courseTaskId: 5 }] as TaskSolution[], [] as TaskChecker[]);
      expect(result).toBe(true);
    });

    it('returns true when a task checker matches the course task', () => {
      const { service } = buildService();
      const result = service.getCourseTaskSubmitted(5, [] as TaskSolution[], [{ courseTaskId: 5 }] as TaskChecker[]);
      expect(result).toBe(true);
    });

    it('returns false when neither solutions nor checkers match', () => {
      const { service } = buildService();
      const result = service.getCourseTaskSubmitted(
        5,
        [{ courseTaskId: 9 }] as TaskSolution[],
        [{ courseTaskId: 8 }] as TaskChecker[],
      );
      expect(result).toBe(false);
    });
  });

  describe('getCurrentTaskScore (via getAll integration)', () => {
    // getCurrentTaskScore is private; exercise it through getAll which feeds
    // score sources and reads the resulting item.score.
    async function scoreFor(opts: {
      taskResults?: unknown[];
      interviewResults?: unknown[];
      stageInterviews?: unknown[];
    }) {
      const deps = buildService();
      const courseTask = {
        id: 5,
        courseId: 333,
        studentStartDate: PAST,
        studentEndDate: FUTURE,
        maxScore: 100,
        scoreWeight: 1,
        crossCheckEndDate: null,
        checker: Checker.Mentor,
        type: 'jstask',
        taskOwner: null,
        task: { name: 'Task', descriptionUrl: 'url', type: 'jstask' },
      };
      deps.courseTaskRepository.find.mockResolvedValue([courseTask]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      deps.taskResultRepository.find.mockResolvedValue(opts.taskResults ?? []);
      deps.taskInterviewResultRepository.find.mockResolvedValue(opts.interviewResults ?? []);
      deps.stageInterviewRepository.find.mockResolvedValue(opts.stageInterviews ?? []);
      deps.taskSolutionRepository.find.mockResolvedValue([]);
      deps.taskCheckerRepository.find.mockResolvedValue([]);
      deps.teamDistributionStudentRepository.find.mockResolvedValue([]);

      const [item] = await deps.service.getAll(333, 777);
      return item.score;
    }

    it('prefers the task result score', async () => {
      expect(await scoreFor({ taskResults: [{ courseTaskId: 5, score: 42 }] })).toBe(42);
    });

    it('falls back to the interview result score when no task result', async () => {
      expect(await scoreFor({ interviewResults: [{ courseTaskId: 5, score: 17 }] })).toBe(17);
    });

    it('uses stage interview resume score when present', async () => {
      const stageInterviews = [
        {
          courseTaskId: 5,
          stageInterviewFeedbacks: [{ json: JSON.stringify({ resume: { score: 88 } }) }],
        },
      ];
      expect(await scoreFor({ stageInterviews })).toBe(88);
    });

    it('uses stage interview decision finalScore when resume score is absent', async () => {
      const stageInterviews = [
        {
          courseTaskId: 5,
          stageInterviewFeedbacks: [{ json: JSON.stringify({ steps: { decision: { values: { finalScore: 55 } } } }) }],
        },
      ];
      expect(await scoreFor({ stageInterviews })).toBe(55);
    });

    it('falls back to 0 for stage interview feedback with neither score', async () => {
      const stageInterviews = [
        {
          courseTaskId: 5,
          stageInterviewFeedbacks: [{ json: JSON.stringify({}) }],
        },
      ];
      expect(await scoreFor({ stageInterviews })).toBe(0);
    });

    it('returns null when there is no score at all (Math.max of empty -> -Infinity)', async () => {
      expect(await scoreFor({})).toBeNull();
    });

    it('picks the maximum across multiple stage interview feedbacks', async () => {
      const stageInterviews = [
        {
          courseTaskId: 5,
          stageInterviewFeedbacks: [
            { json: JSON.stringify({ resume: { score: 30 } }) },
            { json: JSON.stringify({ steps: { decision: { values: { finalScore: 70 } } } }) },
          ],
        },
      ];
      expect(await scoreFor({ stageInterviews })).toBe(70);
    });
  });

  describe('getAll', () => {
    function regularTask(overrides: Record<string, unknown> = {}) {
      return {
        id: 1,
        courseId: 333,
        studentStartDate: PAST,
        studentEndDate: FUTURE,
        maxScore: 100,
        scoreWeight: 2,
        crossCheckEndDate: null,
        checker: Checker.Mentor,
        type: 'jstask',
        taskOwner: { id: 9, firstName: 'Jane', lastName: 'Roe', githubId: 'jane' },
        task: { name: 'Coding Task', descriptionUrl: 'desc-url', type: 'jstask' },
        ...overrides,
      };
    }

    function setupEmptyStudentSources(deps: ReturnType<typeof buildService>) {
      deps.taskResultRepository.find.mockResolvedValue([]);
      deps.taskInterviewResultRepository.find.mockResolvedValue([]);
      deps.stageInterviewRepository.find.mockResolvedValue([]);
      deps.taskSolutionRepository.find.mockResolvedValue([]);
      deps.taskCheckerRepository.find.mockResolvedValue([]);
      deps.teamDistributionStudentRepository.find.mockResolvedValue([]);
    }

    it('maps a regular (non-cross-check) task to a single schedule item with organizer', async () => {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([regularTask()]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      setupEmptyStudentSources(deps);

      const schedule = await deps.service.getAll(333);

      expect(schedule).toHaveLength(1);
      expect(schedule[0]).toMatchObject({
        id: 1,
        name: 'Coding Task',
        courseId: 333,
        startDate: PAST,
        endDate: FUTURE,
        maxScore: 100,
        scoreWeight: 2,
        tag: CourseScheduleItemTag.Coding,
        descriptionUrl: 'desc-url',
        type: CourseScheduleDataSource.CourseTask,
      });
      expect(schedule[0].organizer).toMatchObject({ id: 9, githubId: 'jane', name: 'Jane Roe' });
    });

    it('sets organizer to null when the task has no taskOwner', async () => {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([regularTask({ taskOwner: null })]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      setupEmptyStudentSources(deps);

      const [item] = await deps.service.getAll(333);

      expect(item.organizer).toBeNull();
    });

    it('expands a cross-check task into submit and review items', async () => {
      const deps = buildService();
      const crossCheckTask = regularTask({
        checker: Checker.CrossCheck,
        crossCheckEndDate: new Date('2022-03-30T00:00:00.000Z'),
      });
      deps.courseTaskRepository.find.mockResolvedValue([crossCheckTask]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      setupEmptyStudentSources(deps);

      const schedule = await deps.service.getAll(333);

      expect(schedule).toHaveLength(2);
      expect(schedule.map(i => i.tag)).toEqual([
        CourseScheduleItemTag.CrossCheckSubmit,
        CourseScheduleItemTag.CrossCheckReview,
      ]);
    });

    it('maps course events to schedule items with an event tag and organizer', async () => {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([]);
      deps.courseEventRepository.find.mockResolvedValue([
        {
          id: 7,
          courseId: 333,
          dateTime: PAST,
          endTime: null,
          duration: 60,
          organizer: { id: 3, firstName: 'Org', lastName: 'Anizer', githubId: 'org' },
          event: { name: 'Lecture', descriptionUrl: 'ev-url', type: EventType.Online },
        },
      ]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      setupEmptyStudentSources(deps);

      const schedule = await deps.service.getAll(333);

      expect(schedule).toHaveLength(1);
      expect(schedule[0]).toMatchObject({
        id: 7,
        name: 'Lecture',
        tag: CourseScheduleItemTag.Lecture,
        type: CourseScheduleDataSource.CourseEvent,
        descriptionUrl: 'ev-url',
      });
      expect(schedule[0].organizer).toMatchObject({ githubId: 'org', name: 'Org Anizer' });
    });

    it('maps team distributions to schedule items', async () => {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([
        {
          id: 50,
          name: 'Team Distribution',
          startDate: PAST,
          endDate: FUTURE,
          minTotalScore: 0,
          descriptionUrl: 'td-url',
        },
      ]);
      setupEmptyStudentSources(deps);

      const schedule = await deps.service.getAll(333);

      expect(schedule).toHaveLength(1);
      expect(schedule[0]).toMatchObject({
        id: 50,
        name: 'Team Distribution',
        tag: CourseScheduleItemTag.TeamDistribution,
        type: CourseScheduleDataSource.CourseTeamDistribution,
        descriptionUrl: 'td-url',
      });
    });

    it('sorts items by start date, then by tag priority on ties', async () => {
      const deps = buildService();
      // two tasks sharing the same start date but different tags (self-study vs coding)
      const selfStudy = regularTask({
        id: 1,
        type: 'selfeducation',
        task: { name: 'Self', descriptionUrl: 'u', type: 'selfeducation' },
      });
      const coding = regularTask({
        id: 2,
        type: 'jstask',
        task: { name: 'Code', descriptionUrl: 'u', type: 'jstask' },
      });
      deps.courseTaskRepository.find.mockResolvedValue([coding, selfStudy]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      setupEmptyStudentSources(deps);

      const schedule = await deps.service.getAll(333);

      // self-study (priority 1, mapped to Test tag) sorts before coding (priority 3)
      expect(schedule.map(i => i.tag)).toEqual([CourseScheduleItemTag.Test, CourseScheduleItemTag.Coding]);
    });

    it('sorts strictly by start date when dates differ', async () => {
      const deps = buildService();
      const later = regularTask({ id: 1, studentStartDate: FUTURE, studentEndDate: FUTURE });
      const earlier = regularTask({ id: 2, studentStartDate: PAST, studentEndDate: FUTURE });
      deps.courseTaskRepository.find.mockResolvedValue([later, earlier]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      setupEmptyStudentSources(deps);

      const schedule = await deps.service.getAll(333);

      expect(schedule.map(i => i.id)).toEqual([2, 1]);
    });

    it('uses cache when a studentId is supplied and skips it otherwise', async () => {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      setupEmptyStudentSources(deps);

      await deps.service.getAll(333, 777);

      expect(deps.courseTaskRepository.find).toHaveBeenCalledWith(expect.objectContaining({ cache: 90 * 1000 }));
      expect(deps.courseEventRepository.find).toHaveBeenCalledWith(expect.objectContaining({ cache: 90 * 1000 }));

      deps.courseTaskRepository.find.mockClear();
      await deps.service.getAll(333);
      expect(deps.courseTaskRepository.find).toHaveBeenCalledWith(expect.objectContaining({ cache: undefined }));
    });

    it('loads student-scoped data only when a studentId is supplied', async () => {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      setupEmptyStudentSources(deps);

      await deps.service.getAll(333);

      // Without a studentId the early-return guards skip the repository call.
      expect(deps.taskResultRepository.find).not.toHaveBeenCalled();
      expect(deps.taskInterviewResultRepository.find).not.toHaveBeenCalled();
      expect(deps.stageInterviewRepository.find).not.toHaveBeenCalled();
      expect(deps.taskSolutionRepository.find).not.toHaveBeenCalled();
      expect(deps.taskCheckerRepository.find).not.toHaveBeenCalled();
      expect(deps.teamDistributionStudentRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('getTeamDistributionStatus (via getAll)', () => {
    const distribution = {
      id: 60,
      name: 'TD',
      courseId: 333,
      minTotalScore: 10,
      descriptionUrl: 'u',
    };

    async function statusFor(td: Record<string, unknown>, students: unknown[], studentId: number | undefined = 777) {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([{ ...distribution, ...td }]);
      deps.taskResultRepository.find.mockResolvedValue([]);
      deps.taskInterviewResultRepository.find.mockResolvedValue([]);
      deps.stageInterviewRepository.find.mockResolvedValue([]);
      deps.taskSolutionRepository.find.mockResolvedValue([]);
      deps.taskCheckerRepository.find.mockResolvedValue([]);
      deps.teamDistributionStudentRepository.find.mockResolvedValue(students);

      const [item] = await deps.service.getAll(333, studentId);
      return item.status;
    }

    it('is Future when current time is before the start date', async () => {
      const status = await statusFor({ startDate: FUTURE, endDate: FUTURE }, []);
      expect(status).toBe(CourseScheduleItemStatus.Future);
    });

    it('is Done when the matching student is distributed', async () => {
      const status = await statusFor({ startDate: PAST, endDate: FUTURE }, [
        { teamDistributionId: 60, distributed: true, active: false, student: { totalScore: 100 } },
      ]);
      expect(status).toBe(CourseScheduleItemStatus.Done);
    });

    it('is Registered when the matching student is active but not distributed', async () => {
      const status = await statusFor({ startDate: PAST, endDate: FUTURE }, [
        {
          teamDistributionId: 60,
          distributed: false,
          active: true,
          student: { isExpelled: false, totalScore: 100 },
        },
      ]);
      expect(status).toBe(CourseScheduleItemStatus.Registered);
    });

    it('is Unavailable when no matching student record exists', async () => {
      const status = await statusFor({ startDate: PAST, endDate: FUTURE }, [
        { teamDistributionId: 999, distributed: false, active: false, student: { totalScore: 100 } },
      ]);
      expect(status).toBe(CourseScheduleItemStatus.Unavailable);
    });

    it('is Unavailable when the student is expelled', async () => {
      const status = await statusFor({ startDate: PAST, endDate: FUTURE }, [
        {
          teamDistributionId: 60,
          distributed: false,
          active: false,
          student: { isExpelled: true, totalScore: 100 },
        },
      ]);
      expect(status).toBe(CourseScheduleItemStatus.Unavailable);
    });

    it('is Unavailable when the student total score is below the minimum', async () => {
      const status = await statusFor({ startDate: PAST, endDate: FUTURE, minTotalScore: 50 }, [
        {
          teamDistributionId: 60,
          distributed: false,
          active: false,
          student: { isExpelled: false, totalScore: 10 },
        },
      ]);
      expect(status).toBe(CourseScheduleItemStatus.Unavailable);
    });

    it('is Available within the distribution window for an eligible student', async () => {
      const status = await statusFor({ startDate: PAST, endDate: FUTURE, minTotalScore: 5 }, [
        {
          teamDistributionId: 60,
          distributed: false,
          active: false,
          student: { isExpelled: false, totalScore: 100 },
        },
      ]);
      expect(status).toBe(CourseScheduleItemStatus.Available);
    });

    it('is Missed when the distribution window has closed', async () => {
      const status = await statusFor({ startDate: PAST, endDate: PAST, minTotalScore: 5 }, [
        {
          teamDistributionId: 60,
          distributed: false,
          active: false,
          student: { isExpelled: false, totalScore: 100 },
        },
      ]);
      expect(status).toBe(CourseScheduleItemStatus.Missed);
    });

    it('skips per-student lookup entirely when no studentId is given', async () => {
      // teamDistributionStudents is [] (no studentId) so no record matches -> Unavailable
      const status = await statusFor({ startDate: PAST, endDate: FUTURE }, [], undefined);
      expect(status).toBe(CourseScheduleItemStatus.Unavailable);
    });
  });

  describe('getCourseTaskTag / getCourseEventTag / getEventStatus (via getAll)', () => {
    function taskWithType(courseTaskType: string | null, taskType: string) {
      return {
        id: 1,
        courseId: 333,
        studentStartDate: PAST,
        studentEndDate: FUTURE,
        maxScore: 100,
        scoreWeight: 1,
        crossCheckEndDate: null,
        checker: Checker.Mentor,
        type: courseTaskType,
        taskOwner: null,
        task: { name: 'T', descriptionUrl: 'u', type: taskType },
      };
    }

    async function tagForTask(courseTaskType: string | null, taskType: string) {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([taskWithType(courseTaskType, taskType)]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      const [item] = await deps.service.getAll(333);
      return item.tag;
    }

    it('tags selfeducation tasks as Test', async () => {
      expect(await tagForTask('selfeducation', 'jstask')).toBe(CourseScheduleItemTag.Test);
    });

    it('tags test tasks as Test', async () => {
      expect(await tagForTask('test', 'jstask')).toBe(CourseScheduleItemTag.Test);
    });

    it('tags interview tasks as Interview', async () => {
      expect(await tagForTask('interview', 'jstask')).toBe(CourseScheduleItemTag.Interview);
    });

    it('tags stage-interview tasks as Interview', async () => {
      expect(await tagForTask('stage-interview', 'jstask')).toBe(CourseScheduleItemTag.Interview);
    });

    it('falls back to the task type when the course task type is empty', async () => {
      expect(await tagForTask(null, 'test')).toBe(CourseScheduleItemTag.Test);
    });

    it('tags everything else as Coding', async () => {
      expect(await tagForTask('jstask', 'jstask')).toBe(CourseScheduleItemTag.Coding);
    });

    async function eventResult(event: Record<string, unknown>) {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([]);
      deps.courseEventRepository.find.mockResolvedValue([
        {
          id: 7,
          courseId: 333,
          dateTime: PAST,
          endTime: null,
          duration: 60,
          organizer: { id: 1, firstName: 'A', lastName: 'B', githubId: 'ab' },
          event: { name: 'E', descriptionUrl: 'u', type: EventType.Online },
          ...event,
        },
      ]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      const [item] = await deps.service.getAll(333);
      return item;
    }

    it('tags self-study events as SelfStudy', async () => {
      const item = await eventResult({ event: { name: 'E', descriptionUrl: 'u', type: EventType.SelfStudy } });
      expect(item.tag).toBe(CourseScheduleItemTag.SelfStudy);
    });

    it('tags any other event type as Lecture', async () => {
      const item = await eventResult({ event: { name: 'E', descriptionUrl: 'u', type: EventType.Workshop } });
      expect(item.tag).toBe(CourseScheduleItemTag.Lecture);
    });

    it('marks an event Archived when its end time has passed', async () => {
      const item = await eventResult({
        dateTime: PAST,
        endTime: PAST.getTime().toString(),
      });
      expect(item.status).toBe(CourseScheduleItemStatus.Archived);
    });

    it('marks an event Available when it started but has not ended', async () => {
      const item = await eventResult({ dateTime: PAST, endTime: FUTURE.getTime().toString() });
      expect(item.status).toBe(CourseScheduleItemStatus.Available);
    });

    it('marks an event Future when it has not started yet', async () => {
      const item = await eventResult({ dateTime: FUTURE, endTime: null });
      expect(item.status).toBe(CourseScheduleItemStatus.Future);
    });

    it('derives the end time from duration when endTime is absent', async () => {
      // started in the past, default duration keeps it in the past -> Archived
      const item = await eventResult({ dateTime: PAST, endTime: null, duration: 1 });
      expect(item.status).toBe(CourseScheduleItemStatus.Archived);
    });

    it('uses the default 60 minute duration when duration is null', async () => {
      // started a moment ago without a duration -> still within the default window
      const recent = new Date(NOW.getTime() - 30 * 60 * 1000);
      const item = await eventResult({ dateTime: recent, endTime: null, duration: null });
      expect(item.status).toBe(CourseScheduleItemStatus.Available);
    });
  });

  describe('getCourseTaskStatus (via getAll)', () => {
    function autoTestTask(overrides: Record<string, unknown> = {}) {
      return {
        id: 1,
        courseId: 333,
        studentStartDate: PAST,
        studentEndDate: FUTURE,
        maxScore: 100,
        scoreWeight: 1,
        crossCheckEndDate: null,
        checker: Checker.AutoTest,
        type: 'jstask',
        taskOwner: null,
        task: { name: 'T', descriptionUrl: 'u', type: 'jstask' },
        ...overrides,
      };
    }

    async function statusFor(opts: {
      task: Record<string, unknown>;
      studentId?: number;
      taskResults?: unknown[];
      taskSolutions?: unknown[];
    }) {
      const deps = buildService();
      deps.courseTaskRepository.find.mockResolvedValue([opts.task]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.courseTeamDistributionRepository.find.mockResolvedValue([]);
      deps.taskResultRepository.find.mockResolvedValue(opts.taskResults ?? []);
      deps.taskInterviewResultRepository.find.mockResolvedValue([]);
      deps.stageInterviewRepository.find.mockResolvedValue([]);
      deps.taskSolutionRepository.find.mockResolvedValue(opts.taskSolutions ?? []);
      deps.taskCheckerRepository.find.mockResolvedValue([]);
      deps.teamDistributionStudentRepository.find.mockResolvedValue([]);
      const [item] = await deps.service.getAll(333, opts.studentId);
      return item.status;
    }

    it('is Archived when start or end date is missing', async () => {
      const status = await statusFor({ task: autoTestTask({ studentStartDate: null }) });
      expect(status).toBe(CourseScheduleItemStatus.Archived);
    });

    it('is Future when the start date is in the future', async () => {
      const status = await statusFor({
        task: autoTestTask({ studentStartDate: FUTURE, studentEndDate: FUTURE }),
      });
      expect(status).toBe(CourseScheduleItemStatus.Future);
    });

    it('is Available for an auto-test in progress whose score is below max', async () => {
      const status = await statusFor({
        task: autoTestTask(),
        studentId: 777,
        taskResults: [{ courseTaskId: 1, score: 50 }],
      });
      expect(status).toBe(CourseScheduleItemStatus.Available);
    });

    it('is Done when a score is present and the auto-test is at max', async () => {
      const status = await statusFor({
        task: autoTestTask(),
        studentId: 777,
        taskResults: [{ courseTaskId: 1, score: 100 }],
      });
      expect(status).toBe(CourseScheduleItemStatus.Done);
    });

    it('is Review when submitted but not yet scored', async () => {
      const status = await statusFor({
        task: autoTestTask({ checker: Checker.Mentor }),
        studentId: 777,
        taskSolutions: [{ courseTaskId: 1 }],
      });
      expect(status).toBe(CourseScheduleItemStatus.Review);
    });

    it('is Available within the active period when not submitted nor scored', async () => {
      const status = await statusFor({
        task: autoTestTask({ checker: Checker.Mentor }),
        studentId: 777,
      });
      expect(status).toBe(CourseScheduleItemStatus.Available);
    });

    it('is Missed for a student when the period passed without submission', async () => {
      const status = await statusFor({
        task: autoTestTask({ checker: Checker.Mentor, studentStartDate: PAST, studentEndDate: PAST }),
        studentId: 777,
      });
      expect(status).toBe(CourseScheduleItemStatus.Missed);
    });

    it('is Archived without student data when the period has passed', async () => {
      const status = await statusFor({
        task: autoTestTask({ checker: Checker.Mentor, studentStartDate: PAST, studentEndDate: PAST }),
      });
      expect(status).toBe(CourseScheduleItemStatus.Archived);
    });
  });

  describe('copyFromTo', () => {
    function setupCourses(deps: ReturnType<typeof buildService>, fromStart: Date, toStart: Date) {
      deps.courseRepository.findOneByOrFail
        .mockResolvedValueOnce({ id: 1, startDate: fromStart })
        .mockResolvedValueOnce({ id: 2, startDate: toStart });
    }

    it('copies tasks, events and team distributions shifting all dates by the course offset', async () => {
      const deps = buildService();
      const fromStart = new Date('2022-01-01T00:00:00.000Z');
      const toStart = new Date('2022-01-08T00:00:00.000Z'); // +7 days
      setupCourses(deps, fromStart, toStart);

      deps.courseTaskRepository.find.mockResolvedValue([
        {
          id: 10,
          createdDate: 'c',
          updatedDate: 'u',
          crossCheckStatus: 'initial',
          courseId: 1,
          crossCheckEndDate: '2022-01-05T00:00:00.000Z',
          studentStartDate: new Date('2022-01-02T00:00:00.000Z'),
          studentEndDate: new Date('2022-01-03T00:00:00.000Z'),
          mentorStartDate: null,
          mentorEndDate: null,
          studentRegistrationStartDate: null,
        },
      ]);
      deps.courseEventRepository.find.mockResolvedValue([
        {
          id: 20,
          createdDate: 'c',
          updatedDate: 'u',
          courseId: 1,
          dateTime: new Date('2022-01-04T00:00:00.000Z'),
          endTime: null,
          date: '2022-01-04',
          time: '10:00',
        },
      ]);
      deps.teamDistribution.find.mockResolvedValue([
        {
          id: 30,
          createdDate: 'c',
          updatedDate: 'u',
          courseId: 1,
          startDate: new Date('2022-01-06T00:00:00.000Z'),
          endDate: new Date('2022-01-07T00:00:00.000Z'),
        },
      ]);

      await deps.service.copyFromTo(1, 2);

      const dayMs = 7 * 24 * 60 * 60 * 1000;
      const savedTask = deps.courseTaskRepository.save.mock.calls[0][0];
      expect(savedTask).not.toHaveProperty('id');
      expect(savedTask.courseId).toBe(2);
      expect(savedTask.crossCheckEndDate).toEqual(new Date(new Date('2022-01-05T00:00:00.000Z').getTime() + dayMs));
      expect(savedTask.studentStartDate).toEqual(new Date(new Date('2022-01-02T00:00:00.000Z').getTime() + dayMs));
      // null source dates remain null after adjustment
      expect(savedTask.mentorStartDate).toBeNull();
      expect(savedTask.studentRegistrationStartDate).toBeNull();

      const savedEvent = deps.courseEventRepository.save.mock.calls[0][0];
      expect(savedEvent.courseId).toBe(2);
      expect(savedEvent.date).toBeNull();
      expect(savedEvent.time).toBeNull();
      expect(savedEvent.dateTime).toEqual(new Date(new Date('2022-01-04T00:00:00.000Z').getTime() + dayMs));
      expect(savedEvent.endTime).toBeNull();

      const savedTd = deps.teamDistribution.save.mock.calls[0][0];
      expect(savedTd.courseId).toBe(2);
      expect(savedTd.startDate).toEqual(new Date(new Date('2022-01-06T00:00:00.000Z').getTime() + dayMs));
      expect(savedTd.endDate).toEqual(new Date(new Date('2022-01-07T00:00:00.000Z').getTime() + dayMs));
    });

    it('keeps the original team distribution dates when adjustment returns null', async () => {
      const deps = buildService();
      const fromStart = new Date('2022-01-01T00:00:00.000Z');
      const toStart = new Date('2022-01-01T00:00:00.000Z'); // zero offset
      setupCourses(deps, fromStart, toStart);

      deps.courseTaskRepository.find.mockResolvedValue([]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      // null dates -> adjustDate returns null -> falls back to original (still null)
      deps.teamDistribution.find.mockResolvedValue([
        {
          id: 30,
          createdDate: 'c',
          updatedDate: 'u',
          courseId: 1,
          startDate: null,
          endDate: null,
        },
      ]);

      await deps.service.copyFromTo(1, 2);

      const savedTd = deps.teamDistribution.save.mock.calls[0][0];
      expect(savedTd.startDate).toBeNull();
      expect(savedTd.endDate).toBeNull();
    });

    it('adjusts string dates by parsing them first', async () => {
      const deps = buildService();
      const fromStart = new Date('2022-01-01T00:00:00.000Z');
      const toStart = new Date('2022-01-02T00:00:00.000Z'); // +1 day
      setupCourses(deps, fromStart, toStart);

      deps.courseTaskRepository.find.mockResolvedValue([
        {
          id: 10,
          createdDate: 'c',
          updatedDate: 'u',
          crossCheckStatus: 'initial',
          courseId: 1,
          crossCheckEndDate: null,
          studentStartDate: '2022-01-02T00:00:00.000Z', // string source date
          studentEndDate: null,
          mentorStartDate: null,
          mentorEndDate: null,
          studentRegistrationStartDate: null,
        },
      ]);
      deps.courseEventRepository.find.mockResolvedValue([]);
      deps.teamDistribution.find.mockResolvedValue([]);

      await deps.service.copyFromTo(1, 2);

      const dayMs = 24 * 60 * 60 * 1000;
      const savedTask = deps.courseTaskRepository.save.mock.calls[0][0];
      expect(savedTask.studentStartDate).toEqual(new Date(new Date('2022-01-02T00:00:00.000Z').getTime() + dayMs));
    });

    it('rejects when the source course cannot be found', async () => {
      const deps = buildService();
      deps.courseRepository.findOneByOrFail.mockRejectedValue(new Error('not found'));

      await expect(deps.service.copyFromTo(1, 2)).rejects.toThrow('not found');
    });
  });
});
