import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskSolutionChecker } from '@entities/taskSolutionChecker';
import { CourseCrossCheckService } from './course-cross-checks.service';

const mockRawData = [
  {
    stu_githubId: 1,
    ts_url: 'htpps://example.com',
    omittedField: 'foo',
  },
  {
    stu_githubId: 2,
    ts_url: 'htpps://example.com',
    omittedField: 'bar',
  },
];

const mockRawDataWithDuplicates = mockRawData.concat(mockRawData).concat(mockRawData);

const mockCourseTaskRepositoryFactory = jest.fn(() => ({
  createQueryBuilder: jest.fn(() => ({
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: () => Promise.resolve(mockRawDataWithDuplicates),
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
          provide: getRepositoryToken(TaskSolutionChecker),
          useFactory: mockCourseTaskRepositoryFactory,
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
          githubId: data.stu_githubId,
          solutionUrl: data.ts_url,
        })),
      );
    });
  });
});
