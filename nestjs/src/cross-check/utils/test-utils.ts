// Date is equal to 2022-03-22 00:05 UTC
export const MOCK_CURRENT_TIMESTAMP = 1647907500000;

const MOCK_HOST = 'https://testhost';

enum MockDates {
  DateBeforeDatestring = '2022-03-21T00:00:00.000Z',
  DateAfterDatestring = '2022-03-23T00:00:00.000Z',
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
    studentEndDate: MockDates.DateAfterDatestring,
    crossCheckEndDate: MockDates.DateAfterDatestring,
  },
  {
    id: 2,
    courseId: 2,
    crossCheckStatus: CrossCheckStatuses.Initial,
    studentEndDate: MockDates.DateBeforeDatestring,
    crossCheckEndDate: MockDates.DateBeforeDatestring,
  },
  {
    id: 3,
    courseId: 3,
    crossCheckStatus: CrossCheckStatuses.Initial,
    studentEndDate: MockDates.DateBeforeDatestring,
    crossCheckEndDate: MockDates.DateBeforeDatestring,
  },
  {
    id: 4,
    courseId: 4,
    crossCheckStatus: CrossCheckStatuses.Initial,
    studentEndDate: MockDates.DateAfterDatestring,
    crossCheckEndDate: MockDates.DateAfterDatestring,
  },
  {
    id: 11,
    courseId: 11,
    crossCheckStatus: CrossCheckStatuses.Distributed,
    studentEndDate: MockDates.DateAfterDatestring,
    crossCheckEndDate: MockDates.DateAfterDatestring,
  },
  {
    id: 22,
    courseId: 22,
    crossCheckStatus: CrossCheckStatuses.Distributed,
    studentEndDate: MockDates.DateBeforeDatestring,
    crossCheckEndDate: MockDates.DateBeforeDatestring,
  },
  {
    id: 33,
    courseId: 33,
    crossCheckStatus: CrossCheckStatuses.Distributed,
    studentEndDate: MockDates.DateBeforeDatestring,
    crossCheckEndDate: MockDates.DateBeforeDatestring,
  },
  {
    id: 44,
    courseId: 44,
    crossCheckStatus: CrossCheckStatuses.Distributed,
    studentEndDate: MockDates.DateAfterDatestring,
    crossCheckEndDate: MockDates.DateAfterDatestring,
  },
];

export const mockPost = jest.fn((url, data, config) => ({
  pipe: jest.fn((...callbacks) => []),
}));

const mockCourseTaskRepositoryFind = jest.fn(queryParamsObj => tasks);

const createExpectedRequestUrl = (taskId: number, courseId: number, action: string) =>
  `${MOCK_HOST}/api/course/${courseId}/task/${taskId}/cross-check/${action}`;

export const mockCourseTaskRepositoryFactory = jest.fn(() => ({
  find: mockCourseTaskRepositoryFind,
}));

export const mockConfigService = {
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

const expectedTasksAfterFiltering = {
  distribution: tasks.filter(
    ({ crossCheckStatus, studentEndDate }) =>
      crossCheckStatus === CrossCheckStatuses.Initial && studentEndDate === MockDates.DateBeforeDatestring,
  ),
  completion: tasks.filter(
    ({ crossCheckStatus, crossCheckEndDate }) =>
      crossCheckStatus === CrossCheckStatuses.Distributed && crossCheckEndDate === MockDates.DateBeforeDatestring,
  ),
};

const expectedRequestsUrl = {
  distribution: expectedTasksAfterFiltering.distribution.map(({ id, courseId }) =>
    createExpectedRequestUrl(id, courseId, 'distribution'),
  ),
  completion: expectedTasksAfterFiltering.completion.map(({ id, courseId }) =>
    createExpectedRequestUrl(id, courseId, 'completion'),
  ),
};

const expectedHttpServiceCallsAmount = {
  distribution: expectedTasksAfterFiltering.distribution.length,
  completion: expectedTasksAfterFiltering.completion.length,
};

export const expectedResults = {
  expectedTasksAfterFiltering,
  expectedRequestsUrl,
  expectedHttpServiceCallsAmount,
};
