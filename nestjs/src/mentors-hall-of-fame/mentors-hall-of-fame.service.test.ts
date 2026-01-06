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
    it('returns empty array when no mentors found', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

      const result = await service.getTopMentors();

      expect(result).toEqual([]);
    });

    it('returns mentors sorted by total certified students count DESC', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData);

      const result = await service.getTopMentors();

      expect(result.length).toBe(2);
      expect(result[0]?.githubId).toBe('mentor1');
      expect(result[0]?.totalStudents).toBe(10);
      expect(result[1]?.githubId).toBe('mentor2');
      expect(result[1]?.totalStudents).toBe(5);
    });

    it('calculates dense ranks correctly with mentors sharing same count', async () => {
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

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorsWithTies);

      const result = await service.getTopMentors();

      // Dense ranking: mentors with same count share rank 1, next mentor gets rank 2 (not 3)
      expect(result[0]?.rank).toBe(1);
      expect(result[1]?.rank).toBe(1);
      expect(result[2]?.rank).toBe(2);
    });

    it('returns only top 10 positions including all mentors at each position', async () => {
      const mentorsData = [];
      for (let i = 1; i <= 15; i++) {
        mentorsData.push({
          odtGithubId: `mentor${i}`,
          odtFirstName: `Name${i}`,
          odtLastName: `Last${i}`,
          totalStudents: String(20 - i),
          courseStatsRaw: [],
        });
      }

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorsData);

      const result = await service.getTopMentors();

      // Should return only first 10 positions (ranks 1-10)
      expect(result.length).toBe(10);
      expect(result[0]?.rank).toBe(1);
      expect(result[9]?.rank).toBe(10);
    });

    it('includes all mentors at position 10 even if there are multiple', async () => {
      const mentorsData = [];
      // Create 9 mentors with different counts (ranks 1-9)
      for (let i = 1; i <= 9; i++) {
        mentorsData.push({
          odtGithubId: `mentor${i}`,
          odtFirstName: `Name${i}`,
          odtLastName: `Last${i}`,
          totalStudents: String(20 - i),
          courseStatsRaw: [],
        });
      }
      // Create 3 mentors with same count at position 10
      for (let i = 10; i <= 12; i++) {
        mentorsData.push({
          odtGithubId: `mentor${i}`,
          odtFirstName: `Name${i}`,
          odtLastName: `Last${i}`,
          totalStudents: '10',
          courseStatsRaw: [],
        });
      }

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorsData);

      const result = await service.getTopMentors();

      // Should include all 3 mentors at position 10
      expect(result.length).toBe(12);
      expect(result[9]?.rank).toBe(10);
      expect(result[10]?.rank).toBe(10);
      expect(result[11]?.rank).toBe(10);
    });

    it('aggregates course stats per mentor correctly', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData);

      const result = await service.getTopMentors();

      const mentor1 = result[0];
      expect(mentor1?.courseStats.length).toBe(2);

      const jsCourse = mentor1?.courseStats.find(s => s.courseName === 'JS Course');
      expect(jsCourse?.studentsCount).toBe(2);

      const reactCourse = mentor1?.courseStats.find(s => s.courseName === 'React Course');
      expect(reactCourse?.studentsCount).toBe(1);
    });

    it('formats mentor name from firstName and lastName', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockMentorData);

      const result = await service.getTopMentors();

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
          courseStatsRaw: [],
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mentorWithoutName);

      const result = await service.getTopMentors();

      expect(result[0]?.name).toBe('anonymousMentor');
    });
  });
});
