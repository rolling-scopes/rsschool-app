import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config';
import { Test, TestingModule } from '@nestjs/testing';
import { CrossCheckService } from './cross-check.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '../../../server/src/models/courseTask';
import {
  MOCK_CURRENT_TIMESTAMP,
  mockPost,
  mockCourseTaskRepositoryFactory,
  mockConfigService,
  expectedResults,
} from './utils/test-utils';

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
      const { completion, distribution } = expectedResults.expectedHttpServiceCallsAmount;
      const { length: totalCallsAmount } = mockPost.mock.calls;
      expect(totalCallsAmount).toBe(completion + distribution);
    });

    it('tasks with submission deadline passed should be distributed', () => {
      const distributionUrls = mockPost.mock.calls
        .map(([url]) => url)
        .filter((url: string) => url.endsWith('distribution'));
      expect(distributionUrls).toEqual(expectedResults.expectedRequestsUrl.distribution);
    });

    it('tasks with cross-check deadline passed should be completed', () => {
      const distributionUrls = mockPost.mock.calls
        .map(([url]) => url)
        .filter((url: string) => url.endsWith('completion'));
      expect(distributionUrls).toEqual(expectedResults.expectedRequestsUrl.completion);
    });
  });
});
