import { Test, TestingModule } from '@nestjs/testing';
import { MentorsHallOfFameController } from './mentors-hall-of-fame.controller';
import { MentorsHallOfFameService } from './mentors-hall-of-fame.service';
import { TopMentorDto, MentorCourseStatsDto } from './dto';

const mockTopMentors = [
  new TopMentorDto({
    rank: 1,
    githubId: 'mentor1',
    name: 'John Doe',
    totalStudents: 10,
    courseStats: [new MentorCourseStatsDto('JS Course', 5), new MentorCourseStatsDto('React Course', 5)],
  }),
  new TopMentorDto({
    rank: 2,
    githubId: 'mentor2',
    name: 'Jane Smith',
    totalStudents: 8,
    courseStats: [new MentorCourseStatsDto('JS Course', 8)],
  }),
];

const mockGetTopMentors = jest.fn(() => Promise.resolve(mockTopMentors));

const mockServiceFactory = jest.fn(() => ({
  getTopMentors: mockGetTopMentors,
}));

describe('MentorsHallOfFameController', () => {
  let controller: MentorsHallOfFameController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorsHallOfFameController],
      providers: [{ provide: MentorsHallOfFameService, useFactory: mockServiceFactory }],
    }).compile();

    controller = module.get<MentorsHallOfFameController>(MentorsHallOfFameController);
  });

  describe('getTopMentors', () => {
    it('returns array of top mentors', async () => {
      const result = await controller.getTopMentors(false);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockTopMentors[0]);
      expect(result[1]).toEqual(mockTopMentors[1]);
    });

    it('calls service with allTime=false by default', async () => {
      await controller.getTopMentors(false);

      expect(mockGetTopMentors).toHaveBeenCalledWith(false);
      expect(mockGetTopMentors).toHaveBeenCalledTimes(1);
    });

    it('calls service with allTime=true when provided', async () => {
      await controller.getTopMentors(true);

      expect(mockGetTopMentors).toHaveBeenCalledWith(true);
      expect(mockGetTopMentors).toHaveBeenCalledTimes(1);
    });
  });
});
