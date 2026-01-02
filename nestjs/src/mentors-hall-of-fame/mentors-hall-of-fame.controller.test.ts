import { Test, TestingModule } from '@nestjs/testing';
import { MentorsHallOfFameController } from './mentors-hall-of-fame.controller';
import { MentorsHallOfFameService } from './mentors-hall-of-fame.service';
import { PaginatedTopMentorsDto, TopMentorDto, CourseStatsDto } from './dto';
import { PaginationDto } from 'src/core/dto/pagination.dto';

const mockTopMentor = new TopMentorDto({
  rank: 1,
  githubId: 'mentor1',
  name: 'John Doe',
  totalStudents: 10,
  courseStats: [new CourseStatsDto('JS Course', 5), new CourseStatsDto('React Course', 5)],
});

const mockPagination = new PaginationDto(20, 1, 50, 3);

const mockGetTopMentors = jest.fn(() =>
  Promise.resolve({
    items: [mockTopMentor],
    pagination: mockPagination,
  }),
);

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
    it('returns 200 with valid response structure', async () => {
      const result = await controller.getTopMentors();

      expect(result).toBeInstanceOf(PaginatedTopMentorsDto);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockTopMentor);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('uses default pagination values when not provided', async () => {
      await controller.getTopMentors();

      expect(mockGetTopMentors).toHaveBeenCalledWith(1, 20);
    });

    it('uses default pagination when page is undefined', async () => {
      await controller.getTopMentors(undefined, undefined);

      expect(mockGetTopMentors).toHaveBeenCalledWith(1, 20);
    });

    it('uses custom pagination parameters', async () => {
      await controller.getTopMentors('2', '50');

      expect(mockGetTopMentors).toHaveBeenCalledWith(2, 50);
    });

    it('handles invalid page parameter by defaulting to 1', async () => {
      await controller.getTopMentors('invalid', '20');

      expect(mockGetTopMentors).toHaveBeenCalledWith(1, 20);
    });

    it('handles invalid limit parameter by defaulting to 20', async () => {
      await controller.getTopMentors('1', 'invalid');

      expect(mockGetTopMentors).toHaveBeenCalledWith(1, 20);
    });

    it('enforces minimum page value of 1', async () => {
      await controller.getTopMentors('0', '20');

      expect(mockGetTopMentors).toHaveBeenCalledWith(1, 20);
    });

    it('uses default limit when value is 0', async () => {
      await controller.getTopMentors('1', '0');

      expect(mockGetTopMentors).toHaveBeenCalledWith(1, 20);
    });

    it('enforces minimum limit value of 1 for negative values', async () => {
      await controller.getTopMentors('1', '-5');

      expect(mockGetTopMentors).toHaveBeenCalledWith(1, 1);
    });

    it('enforces maximum limit value of 100', async () => {
      await controller.getTopMentors('1', '200');

      expect(mockGetTopMentors).toHaveBeenCalledWith(1, 100);
    });
  });
});
