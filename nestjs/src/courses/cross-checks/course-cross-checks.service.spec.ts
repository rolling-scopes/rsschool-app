import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskSolutionChecker } from '@entities/taskSolutionChecker';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { TaskSolution } from '@entities/taskSolution';
import { TaskSolutionResult } from '@entities/taskSolutionResult';

const mockRawData = [
  {
    githubId: 1,
    url: 'htpps://example.com',
    omittedField: 'foo',
  },
  {
    githubId: 2,
    url: 'htpps://example.com',
    omittedField: 'bar',
  },
];

const mockTaskSolutionRepositoryFactory = jest.fn(() => ({
  createQueryBuilder: jest.fn(() => ({
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: () => Promise.resolve(mockRawData),
  })),
}));

const mockCourseId = 12345;
const mockCourseTaskId = 54321;

describe('CourseCrossCheckService', () => {
  let service: CourseCrossCheckService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseCrossCheckService,
        {
          provide: getRepositoryToken(TaskSolution),
          useFactory: mockTaskSolutionRepositoryFactory,
        },
        {
          provide: getRepositoryToken(TaskSolutionChecker),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaskSolutionResult),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CourseCrossCheckService>(CourseCrossCheckService);
  });

  describe('getSolutionsUrls', () => {
    it('should return transformed data from repositories correctly', async () => {
      const pairs = await service.getSolutionsUrls(mockCourseId, mockCourseTaskId);

      expect(pairs).toStrictEqual(
        mockRawData.map(data => ({
          githubId: data.githubId,
          solutionUrl: data.url,
        })),
      );
    });
  });
});
