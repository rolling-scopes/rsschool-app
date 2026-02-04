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
    totalGratitudes: '5',
    courseStatsRaw: [
      { courseName: 'JS Course', studentId: 1 },
      { courseName: 'JS Course', studentId: 2 },
      { courseName: 'React Course', studentId: 3 },
    ],
  },
  {
    odtGithubId: 'mentor2',
    odtFirstName: 'Jane',
    odtLastName: 'Smith',
    totalStudents: '5',
    totalGratitudes: '3',
    courseStatsRaw: [{ courseName: 'JS Course', studentId: 1 }],
  },
];

const mockGratitudesQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  getQuery: jest.fn().mockReturnValue('gratitudes_subquery'),
};

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
  getRawMany: jest.fn(),
};

const mockUserRepository = {
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  manager: {
    createQueryBuilder: jest.fn(() => mockGratitudesQueryBuilder),
  },
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
    it('returns empty array when cache is empty', () => {
      const result = service.getTopMentors();

      expect(result).toEqual([]);
    });
  });

  describe('refreshCache', () => {
    it('returns empty array when no mentors found', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      await service.refreshCache();

      const result = service.getTopMentors();
      expect(result).toEqual([]);
    });

    it('returns mentors sorted by total certified students count DESC', async () => {
      const allTimeMentors = [
        {
          odtGithubId: 'mentor3',
          odtFirstName: 'Alex',
          odtLastName: 'Brown',
          totalStudents: '12',
          totalGratitudes: '7',
          courseStatsRaw: [],
        },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData).mockResolvedValueOnce(allTimeMentors);

      await service.refreshCache();

      const result = service.getTopMentors();
      const allTimeResult = service.getTopMentors(true);

      expect(result.length).toBe(2);
      expect(result[0]?.githubId).toBe('mentor1');
      expect(result[0]?.totalStudents).toBe(10);
      expect(result[1]?.githubId).toBe('mentor2');
      expect(result[1]?.totalStudents).toBe(5);
      expect(allTimeResult.length).toBe(1);
      expect(allTimeResult[0]?.githubId).toBe('mentor3');
    });

    it('assigns sequential ranks to mentors', async () => {
      const mentorsWithTies = [
        {
          odtGithubId: 'mentor1',
          odtFirstName: 'John',
          odtLastName: 'Doe',
          totalStudents: '10',
          totalGratitudes: '5',
          courseStatsRaw: [],
        },
        {
          odtGithubId: 'mentor2',
          odtFirstName: 'Jane',
          odtLastName: 'Smith',
          totalStudents: '10',
          totalGratitudes: '3',
          courseStatsRaw: [],
        },
        {
          odtGithubId: 'mentor3',
          odtFirstName: 'Bob',
          odtLastName: 'Johnson',
          totalStudents: '5',
          totalGratitudes: '2',
          courseStatsRaw: [],
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorsWithTies).mockResolvedValueOnce([]);

      await service.refreshCache();

      const result = service.getTopMentors();

      // Sequential ranking: each mentor gets their position as rank
      expect(result[0]?.rank).toBe(1);
      expect(result[1]?.rank).toBe(2);
      expect(result[2]?.rank).toBe(3);
    });

    it('returns only top 100 mentors when there are more', async () => {
      const mentorsData = [];
      for (let i = 1; i <= 150; i++) {
        mentorsData.push({
          odtGithubId: `mentor${i}`,
          odtFirstName: `Name${i}`,
          odtLastName: `Last${i}`,
          totalStudents: String(200 - i),
          totalGratitudes: String(i),
          courseStatsRaw: [],
        });
      }

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorsData).mockResolvedValueOnce([]);

      await service.refreshCache();

      const result = service.getTopMentors();

      // Should return only first 100 mentors
      expect(result.length).toBe(100);
      expect(result[0]?.rank).toBe(1);
      expect(result[99]?.rank).toBe(100);
    });

    it('includes all mentors with same count at position 100 boundary', async () => {
      const mentorsData = [];
      // Create 99 mentors with different counts (positions 1-99)
      for (let i = 1; i <= 99; i++) {
        mentorsData.push({
          odtGithubId: `mentor${i}`,
          odtFirstName: `Name${i}`,
          odtLastName: `Last${i}`,
          totalStudents: String(200 - i),
          totalGratitudes: String(i),
          courseStatsRaw: [],
        });
      }
      // Create 5 mentors with same count at position 100 boundary
      for (let i = 100; i <= 104; i++) {
        mentorsData.push({
          odtGithubId: `mentor${i}`,
          odtFirstName: `Name${i}`,
          odtLastName: `Last${i}`,
          totalStudents: '50',
          totalGratitudes: String(i),
          courseStatsRaw: [],
        });
      }

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorsData).mockResolvedValueOnce([]);

      await service.refreshCache();

      const result = service.getTopMentors();

      // Should include all 5 mentors with count=50 at the boundary
      expect(result.length).toBe(104);
      expect(result[99]?.totalStudents).toBe(50);
      expect(result[103]?.totalStudents).toBe(50);
    });

    it('aggregates course stats per mentor correctly', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData).mockResolvedValueOnce([]);

      await service.refreshCache();

      const result = service.getTopMentors();

      const mentor1 = result[0];
      expect(mentor1?.courseStats.length).toBe(2);

      const jsCourse = mentor1?.courseStats.find(s => s.courseName === 'JS Course');
      expect(jsCourse?.studentsCount).toBe(2);

      const reactCourse = mentor1?.courseStats.find(s => s.courseName === 'React Course');
      expect(reactCourse?.studentsCount).toBe(1);
    });

    it('formats mentor name from firstName and lastName', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData).mockResolvedValueOnce([]);

      await service.refreshCache();

      const result = service.getTopMentors();

      expect(result[0]?.name).toBe('John Doe');
      expect(result[1]?.name).toBe('Jane Smith');
    });

    it('uses githubId as name when firstName and lastName are empty', async () => {
      const mentorWithoutName = [
        {
          odtGithubId: 'anonymousMentor',
          odtFirstName: null,
          odtLastName: null,
          totalStudents: '5',
          totalGratitudes: '2',
          courseStatsRaw: [],
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorWithoutName).mockResolvedValueOnce([]);

      await service.refreshCache();

      const result = service.getTopMentors();

      expect(result[0]?.name).toBe('anonymousMentor');
    });

    it('handles duplicate student-course pairs correctly', async () => {
      const mentorWithDuplicates = [
        {
          odtGithubId: 'mentor1',
          odtFirstName: 'John',
          odtLastName: 'Doe',
          totalStudents: '3',
          totalGratitudes: '4',
          courseStatsRaw: [
            { courseName: 'JS Course', studentId: 1 },
            { courseName: 'JS Course', studentId: 1 },
            { courseName: 'JS Course', studentId: 2 },
            { courseName: 'React Course', studentId: 3 },
          ],
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorWithDuplicates).mockResolvedValueOnce([]);

      await service.refreshCache();

      const result = service.getTopMentors();

      expect(result[0]?.totalStudents).toBe(3);
      const jsCourse = result[0]?.courseStats.find(s => s.courseName === 'JS Course');
      expect(jsCourse?.studentsCount).toBe(2);
      const reactCourse = result[0]?.courseStats.find(s => s.courseName === 'React Course');
      expect(reactCourse?.studentsCount).toBe(1);
    });

    it('applies date filter when allTime is false (default)', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData).mockResolvedValueOnce(mockMentorData);

      await service.refreshCache();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('certificate.issueDate >= :oneYearAgo', expect.any(Object));
      expect(mockQueryBuilder.where).toHaveBeenCalledTimes(1);
    });

    it('logs and keeps cache unchanged when refresh fails', async () => {
      const loggerErrorSpy = jest.spyOn(
        (service as unknown as { logger: { error: (message: string, error: unknown) => void } }).logger,
        'error',
      );
      mockQueryBuilder.getRawMany.mockRejectedValueOnce(new Error('db failed'));

      await service.refreshCache();

      expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to refresh cache', expect.any(Error));
      expect(service.getTopMentors()).toEqual([]);
    });
  });
});
