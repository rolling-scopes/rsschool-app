import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseMentorsController } from './course-mentors.controller';
import { CourseMentorsService } from './course-mentors.service';
import { MentorDetailsDto } from './dto/mentor-details.dto';
import { SearchMentorDto } from './dto/search-mentor.dto';

const courseMentorsService = {
  createMentor: vi.fn(),
  expelMentor: vi.fn(),
  restoreMentor: vi.fn(),
  getMentorsWithStats: vi.fn(),
  searchMentors: vi.fn(),
};

const createReq = (user: Record<string, unknown>) => ({ user }) as never;
const createRes = () => ({ setHeader: vi.fn(), end: vi.fn() });

describe('CourseMentorsController', () => {
  let controller: CourseMentorsController;

  beforeEach(async () => {
    Object.values(courseMentorsService).forEach(fn => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseMentorsController],
      providers: [{ provide: CourseMentorsService, useValue: courseMentorsService }],
    }).compile();

    controller = module.get(CourseMentorsController);
  });

  describe('createMentor', () => {
    const dto = { students: [1, 2], maxStudentsLimit: 3 } as never;

    it('lowercases the github param and delegates to the service for the same user', async () => {
      const req = createReq({ githubId: 'john-doe', isAdmin: false });

      await controller.createMentor(req, 5, 'John-Doe', dto);

      expect(courseMentorsService.createMentor).toHaveBeenCalledWith(req.user, 5, 'john-doe', dto);
    });

    it('resolves the "me" alias to the requester github id', async () => {
      const req = createReq({ githubId: 'john-doe', isAdmin: false });

      await controller.createMentor(req, 5, 'me', dto);

      expect(courseMentorsService.createMentor).toHaveBeenCalledWith(req.user, 5, 'john-doe', dto);
    });

    it('allows admins to create a mentor for another user', async () => {
      const req = createReq({ githubId: 'admin', isAdmin: true });

      await controller.createMentor(req, 5, 'someone-else', dto);

      expect(courseMentorsService.createMentor).toHaveBeenCalledWith(req.user, 5, 'someone-else', dto);
    });

    it('forbids a non-admin from creating a mentor for someone else', async () => {
      const req = createReq({ githubId: 'john-doe', isAdmin: false });

      await expect(controller.createMentor(req, 5, 'someone-else', dto)).rejects.toBeInstanceOf(ForbiddenException);
      expect(courseMentorsService.createMentor).not.toHaveBeenCalled();
    });
  });

  describe('expelMentor', () => {
    it('delegates to the service with courseId and githubId', async () => {
      await controller.expelMentor(5, 'john-doe');

      expect(courseMentorsService.expelMentor).toHaveBeenCalledWith(5, 'john-doe');
    });
  });

  describe('restoreMentor', () => {
    it('delegates to the service with courseId and githubId', async () => {
      await controller.restoreMentor(5, 'john-doe');

      expect(courseMentorsService.restoreMentor).toHaveBeenCalledWith(5, 'john-doe');
    });
  });

  describe('getMentorsDetails', () => {
    it('maps service records to MentorDetailsDto instances', async () => {
      const record = { githubId: 'john-doe', students: [], cityName: 'Minsk' };
      courseMentorsService.getMentorsWithStats.mockResolvedValue([record]);

      const result = await controller.getMentorsDetails(5);

      expect(courseMentorsService.getMentorsWithStats).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MentorDetailsDto);
      expect(result[0]?.githubId).toBe('john-doe');
    });

    it('returns an empty array when there are no mentors', async () => {
      courseMentorsService.getMentorsWithStats.mockResolvedValue([]);

      const result = await controller.getMentorsDetails(5);

      expect(result).toStrictEqual([]);
    });
  });

  describe('getMentorsDetailsCsv', () => {
    it('responds with flattened csv content and csv headers', async () => {
      courseMentorsService.getMentorsWithStats.mockResolvedValue([
        { githubId: 'john-doe', screenings: { total: 2, completed: 1 } },
      ]);
      const res = createRes();

      await controller.getMentorsDetailsCsv(5, res as never);

      expect(courseMentorsService.getMentorsWithStats).toHaveBeenCalledWith(5);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith('Content-disposition', 'filename=mentors.csv');
      const csv = res.end.mock.calls[0][0] as string;
      // json2csv flattens nested objects with dot-notation headers
      expect(csv).toContain('"githubId"');
      expect(csv).toContain('"screenings.total"');
      expect(csv).toContain('john-doe');
    });
  });

  describe('searchMentors', () => {
    it('appends a wildcard, delegates and maps results to SearchMentorDto', async () => {
      courseMentorsService.searchMentors.mockResolvedValue([{ id: 7, githubId: 'john-doe', name: 'John Doe' }]);

      const result = await controller.searchMentors(5, 'john');

      expect(courseMentorsService.searchMentors).toHaveBeenCalledWith(5, 'john%');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SearchMentorDto);
      expect(result[0]).toEqual({ id: 7, githubId: 'john-doe', name: 'John Doe' });
    });
  });
});
