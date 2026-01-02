import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { MentorsHallOfFameService } from './mentors-hall-of-fame.service';

const mockMentorData = [
  {
    odtGithubId: 'mentor1',
    odtFirstName: 'John',
    odtLastName: 'Doe',
    totalStudents: '10',
    courseStatsRaw: [
      { courseName: 'JS Course', count: 1 },
      { courseName: 'JS Course', count: 1 },
      { courseName: 'React Course', count: 1 },
    ],
  },
  {
    odtGithubId: 'mentor2',
    odtFirstName: 'Jane',
    odtLastName: 'Smith',
    totalStudents: '5',
    courseStatsRaw: [{ courseName: 'JS Course', count: 1 }],
  },
];

const mockAllCountsData = [
  { githubId: 'mentor1', totalStudents: '10' },
  { githubId: 'mentor2', totalStudents: '5' },
];

const mockQueryBuilder = {
  innerJoin: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getRawOne: jest.fn(),
  getRawMany: jest.fn(),
};

const mockUserRepository = {
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

describe('MentorsHallOfFameService', () => {
  let service: MentorsHallOfFameService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorsHallOfFameService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<MentorsHallOfFameService>(MentorsHallOfFameService);
  });

  describe('getTopMentors', () => {
    it('returns correct pagination metadata', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '25' });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData).mockResolvedValueOnce(mockAllCountsData);

      const result = await service.getTopMentors(1, 20);

      expect(result.pagination.current).toBe(1);
      expect(result.pagination.pageSize).toBe(20);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('returns empty items when no mentors found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '0' });

      const result = await service.getTopMentors(1, 20);

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('returns mentors sorted by total certified students count DESC', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '2' });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData).mockResolvedValueOnce(mockAllCountsData);

      const result = await service.getTopMentors(1, 20);

      expect(result.items.length).toBe(2);
      expect(result.items[0]?.githubId).toBe('mentor1');
      expect(result.items[0]?.totalStudents).toBe(10);
      expect(result.items[1]?.githubId).toBe('mentor2');
      expect(result.items[1]?.totalStudents).toBe(5);
    });

    it('calculates ranks correctly with mentors sharing same count', async () => {
      const mentorsWithTies = [
        {
          odtGithubId: 'mentor1',
          odtFirstName: 'John',
          odtLastName: 'Doe',
          totalStudents: '10',
          courseStatsRaw: [],
        },
        {
          odtGithubId: 'mentor2',
          odtFirstName: 'Jane',
          odtLastName: 'Smith',
          totalStudents: '10',
          courseStatsRaw: [],
        },
        {
          odtGithubId: 'mentor3',
          odtFirstName: 'Bob',
          odtLastName: 'Johnson',
          totalStudents: '5',
          courseStatsRaw: [],
        },
      ];

      const allCountsWithTies = [
        { githubId: 'mentor1', totalStudents: '10' },
        { githubId: 'mentor2', totalStudents: '10' },
        { githubId: 'mentor3', totalStudents: '5' },
      ];

      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '3' });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorsWithTies).mockResolvedValueOnce(allCountsWithTies);

      const result = await service.getTopMentors(1, 20);

      // Mentors with same count share rank 1, next mentor gets rank 3 (not 2)
      expect(result.items[0]?.rank).toBe(1);
      expect(result.items[1]?.rank).toBe(1);
      expect(result.items[2]?.rank).toBe(3);
    });

    it('aggregates course stats per mentor correctly', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '2' });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData).mockResolvedValueOnce(mockAllCountsData);

      const result = await service.getTopMentors(1, 20);

      const mentor1 = result.items[0];
      expect(mentor1?.courseStats.length).toBe(2);

      const jsCourse = mentor1?.courseStats.find(s => s.courseName === 'JS Course');
      expect(jsCourse?.studentsCount).toBe(2);

      const reactCourse = mentor1?.courseStats.find(s => s.courseName === 'React Course');
      expect(reactCourse?.studentsCount).toBe(1);
    });

    it('formats mentor name from firstName and lastName', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '2' });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData).mockResolvedValueOnce(mockAllCountsData);

      const result = await service.getTopMentors(1, 20);

      expect(result.items[0]?.name).toBe('John Doe');
      expect(result.items[1]?.name).toBe('Jane Smith');
    });

    it('uses githubId as name when firstName and lastName are empty', async () => {
      const mentorWithoutName = [
        {
          odtGithubId: 'anonymousMentor',
          odtFirstName: null,
          odtLastName: null,
          totalStudents: '5',
          courseStatsRaw: [],
        },
      ];

      const allCounts = [{ githubId: 'anonymousMentor', totalStudents: '5' }];

      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ count: '1' });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorWithoutName).mockResolvedValueOnce(allCounts);

      const result = await service.getTopMentors(1, 20);

      expect(result.items[0]?.name).toBe('anonymousMentor');
    });
  });
});
