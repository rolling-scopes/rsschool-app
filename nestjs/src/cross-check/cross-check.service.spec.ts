import { Test, TestingModule } from '@nestjs/testing';
import { CrossCheckService } from './cross-check.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '../../../server/src/models/courseTask';
import { CourseCrossCheckService } from '../courses/cross-checks';

const MOCK_CURRENT_TIMESTAMP = new Date('2022-03-22 00:05 UTC').getTime();

enum MockDate {
  DateBefore = '2022-03-21T00:00:00.000Z',
  DateAfter = '2022-03-23T00:00:00.000Z',
}

enum CrossCheckStatus {
  Initial = 'initial',
  Distributed = 'distributed',
  Completed = 'completed',
}

const tasks = [
  {
    id: 1,
    courseId: 1,
    crossCheckStatus: CrossCheckStatus.Initial,
    studentEndDate: MockDate.DateAfter,
    crossCheckEndDate: MockDate.DateBefore,
  },
  {
    id: 2,
    courseId: 2,
    crossCheckStatus: CrossCheckStatus.Initial,
    studentEndDate: MockDate.DateBefore,
    crossCheckEndDate: MockDate.DateAfter,
  },
  {
    id: 3,
    courseId: 3,
    crossCheckStatus: CrossCheckStatus.Initial,
    studentEndDate: MockDate.DateBefore,
    crossCheckEndDate: MockDate.DateBefore,
  },
  {
    id: 4,
    courseId: 4,
    crossCheckStatus: CrossCheckStatus.Initial,
    studentEndDate: MockDate.DateAfter,
    crossCheckEndDate: MockDate.DateAfter,
  },
  {
    id: 11,
    courseId: 11,
    crossCheckStatus: CrossCheckStatus.Distributed,
    studentEndDate: MockDate.DateBefore,
    crossCheckEndDate: MockDate.DateAfter,
  },
  {
    id: 22,
    courseId: 22,
    crossCheckStatus: CrossCheckStatus.Distributed,
    studentEndDate: MockDate.DateBefore,
    crossCheckEndDate: MockDate.DateBefore,
  },
  {
    id: 33,
    courseId: 33,
    crossCheckStatus: CrossCheckStatus.Distributed,
    studentEndDate: MockDate.DateAfter,
    crossCheckEndDate: MockDate.DateBefore,
  },
  {
    id: 44,
    courseId: 44,
    crossCheckStatus: CrossCheckStatus.Distributed,
    studentEndDate: MockDate.DateBefore,
    crossCheckEndDate: MockDate.DateAfter,
  },
];

const mockRunDistribution = vi.fn();
const mockRunCompletion = vi.fn();

const mockCourseTaskRepositoryFind = vi.fn(() => tasks);

const mockCourseTaskRepositoryFactory = vi.fn(() => ({
  find: mockCourseTaskRepositoryFind,
}));

describe('CrossCheckService', () => {
  let service: CrossCheckService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrossCheckService,
        {
          provide: CourseCrossCheckService,
          useValue: {
            runDistribution: mockRunDistribution,
            runCompletion: mockRunCompletion,
          },
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
    beforeEach(async () => {
      mockRunDistribution.mockClear();
      mockRunCompletion.mockClear();
      vi.spyOn(Date, 'now').mockImplementation(() => MOCK_CURRENT_TIMESTAMP);
      await service.executeCronJobs();
    });

    it('tasks with submission deadline passed should be distributed (via service, no HTTP)', () => {
      expect(mockRunDistribution).toHaveBeenCalledTimes(2);
      expect(mockRunDistribution).toHaveBeenNthCalledWith(1, 2);
      expect(mockRunDistribution).toHaveBeenNthCalledWith(2, 3);
    });

    it('tasks with cross-check deadline passed should be completed (via service, no HTTP)', () => {
      expect(mockRunCompletion).toHaveBeenCalledTimes(2);
      expect(mockRunCompletion).toHaveBeenNthCalledWith(1, 22);
      expect(mockRunCompletion).toHaveBeenNthCalledWith(2, 33);
    });
  });
});
