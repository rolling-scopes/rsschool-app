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
} from '@entities/index';

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
      jest.restoreAllMocks();
    });
    it('should create 2 items from task', () => {
      const mockStatus = CourseScheduleItemStatus.Available;
      jest.spyOn(service, 'getCrossCheckItemStatus').mockReturnValue(mockStatus);
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
      jest.useFakeTimers().setSystemTime(MOCK_CURRENT_TIME);
    });

    afterAll(() => {
      jest.useRealTimers();
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
