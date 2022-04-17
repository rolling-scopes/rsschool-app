import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config';
import { Test, TestingModule } from '@nestjs/testing';
import { CrossCheckService } from './cross-check.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '../../../server/src/models/courseTask';

const MOCK_CURRENT_TIMESTAMP = new Date('2022-03-22 00:05 UTC').getTime();

const MOCK_HOST = 'https://testhost';

const mockConfigService = {
  users: {
    root: {
      username: 'TEST_USERNAME',
      password: 'TEST_PASSWORD',
    },
  },
  crossCheckScheduling: {
    host: MOCK_HOST,
  },
};

const expectedAuthHeader = `Basic ${Buffer.from(
  mockConfigService.users.root.username + ':' + mockConfigService.users.root.password,
).toString('base64')}`;

enum MockDates {
  DateBefore = '2022-03-21T00:00:00.000Z',
  DateAfter = '2022-03-23T00:00:00.000Z',
}

enum CrossCheckStatuses {
  Initial = 'initial',
  Distributed = 'distributed',
  Completed = 'completed',
}

const tasks = [
  {
    id: 1,
    courseId: 1,
    crossCheckStatus: CrossCheckStatuses.Initial,
    studentEndDate: MockDates.DateAfter,
    crossCheckEndDate: MockDates.DateBefore,
  },
  {
    id: 2,
    courseId: 2,
    crossCheckStatus: CrossCheckStatuses.Initial,
    studentEndDate: MockDates.DateBefore,
    crossCheckEndDate: MockDates.DateAfter,
  },
  {
    id: 3,
    courseId: 3,
    crossCheckStatus: CrossCheckStatuses.Initial,
    studentEndDate: MockDates.DateBefore,
    crossCheckEndDate: MockDates.DateBefore,
  },
  {
    id: 4,
    courseId: 4,
    crossCheckStatus: CrossCheckStatuses.Initial,
    studentEndDate: MockDates.DateAfter,
    crossCheckEndDate: MockDates.DateAfter,
  },
  {
    id: 11,
    courseId: 11,
    crossCheckStatus: CrossCheckStatuses.Distributed,
    studentEndDate: MockDates.DateBefore,
    crossCheckEndDate: MockDates.DateAfter,
  },
  {
    id: 22,
    courseId: 22,
    crossCheckStatus: CrossCheckStatuses.Distributed,
    studentEndDate: MockDates.DateBefore,
    crossCheckEndDate: MockDates.DateBefore,
  },
  {
    id: 33,
    courseId: 33,
    crossCheckStatus: CrossCheckStatuses.Distributed,
    studentEndDate: MockDates.DateAfter,
    crossCheckEndDate: MockDates.DateBefore,
  },
  {
    id: 44,
    courseId: 44,
    crossCheckStatus: CrossCheckStatuses.Distributed,
    studentEndDate: MockDates.DateBefore,
    crossCheckEndDate: MockDates.DateAfter,
  },
];

const expectedDistributionCalls = [
  [
    `${MOCK_HOST}/api/course/2/task/2/cross-check/distribution`,
    null,
    { headers: { Authorization: expectedAuthHeader } },
  ],
  [
    `${MOCK_HOST}/api/course/3/task/3/cross-check/distribution`,
    null,
    { headers: { Authorization: expectedAuthHeader } },
  ],
];

const expectedCompletionCalls = [
  [
    `${MOCK_HOST}/api/course/22/task/22/cross-check/completion`,
    null,
    { headers: { Authorization: expectedAuthHeader } },
  ],
  [
    `${MOCK_HOST}/api/course/33/task/33/cross-check/completion`,
    null,
    { headers: { Authorization: expectedAuthHeader } },
  ],
];

const mockPost = jest.fn((url, data, config) => ({
  pipe: jest.fn((...callbacks) => []),
}));

const mockCourseTaskRepositoryFind = jest.fn(queryParamsObj => tasks);

const mockCourseTaskRepositoryFactory = jest.fn(() => ({
  find: mockCourseTaskRepositoryFind,
}));

describe('CrossCheckService', () => {
  let service: CrossCheckService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrossCheckService,
        {
          provide: HttpService,
          useValue: {
            post: mockPost,
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(CourseTask),
          useFactory: mockCourseTaskRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<CrossCheckService>(CrossCheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have executeCronJobs method', () => {
    expect(service).toHaveProperty('executeCronJobs');
  });

  describe('executeCronJobs should work correctly', () => {
    beforeAll(async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => MOCK_CURRENT_TIMESTAMP);
      await service.executeCronJobs();
    });

    it('httpService.post should be called right amout of times', () => {
      const expectedHttpServiceCallsAmount = expectedDistributionCalls.length + expectedCompletionCalls.length;

      expect(mockPost).toBeCalledTimes(expectedHttpServiceCallsAmount);
    });

    it('tasks with submission deadline passed should be distributed', () => {
      expectedDistributionCalls.forEach(call => expect(mockPost.mock.calls).toContainEqual(call));
    });

    it('tasks with cross-check deadline passed should be completed', () => {
      expectedDistributionCalls.forEach(call => expect(mockPost.mock.calls).toContainEqual(call));
    });
  });
});
