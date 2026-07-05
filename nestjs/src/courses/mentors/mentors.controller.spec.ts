import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';

const mentorId = 9;
const courseId = 7;

const mockStudentInput = {
  id: 1,
  isExpelled: false,
  user: { githubId: 'jane-roe', firstName: 'Jane', lastName: 'Roe' },
};

const mockMentorOptions = {
  maxStudentsLimit: 4,
  studentsPreference: 'any',
  students: [mockStudentInput],
};

const mockStudentEntity = {
  id: 1,
  isExpelled: false,
  rank: 3,
  totalScore: 100,
  user: { githubId: 'jane-roe', firstName: 'Jane', lastName: 'Roe', cityName: null, countryName: null },
  feedbacks: [],
};

const mockDashboard = [{ studentName: 'Jane', courseTaskId: 1 }];

const mockMentorsService = {
  getMentorOptions: vi.fn(),
  getStudents: vi.fn(),
  getCourseStudentsCount: vi.fn(),
  getStudentsTasks: vi.fn(),
  getRandomTask: vi.fn(),
};

const createReq = (user: Record<string, unknown>) => ({ user }) as never;

describe('MentorsController', () => {
  let controller: MentorsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorsController],
      providers: [{ provide: MentorsService, useValue: mockMentorsService }],
    }).compile();

    controller = module.get(MentorsController);
  });

  describe('getMentorOptions', () => {
    it('returns MentorOptionsDto when the requesting mentor matches the route mentor', async () => {
      mockMentorsService.getMentorOptions.mockResolvedValue(mockMentorOptions);
      const req = createReq({ courses: { [courseId]: { mentorId } } });

      const result = await controller.getMentorOptions(mentorId, courseId, req);

      expect(mockMentorsService.getMentorOptions).toHaveBeenCalledWith(mentorId);
      expect(result).toMatchObject({
        maxStudentsLimit: 4,
        preferedStudentsLocation: 'any',
        students: [{ id: 1, githubId: 'jane-roe', name: 'Jane Roe' }],
      });
    });

    it('throws ForbiddenException when the session mentorId differs from the route mentorId', async () => {
      const req = createReq({ courses: { [courseId]: { mentorId: 999 } } });

      await expect(controller.getMentorOptions(mentorId, courseId, req)).rejects.toThrow(ForbiddenException);
      expect(mockMentorsService.getMentorOptions).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the user is not a mentor in the course', async () => {
      const req = createReq({ courses: {} });

      await expect(controller.getMentorOptions(mentorId, courseId, req)).rejects.toThrow(ForbiddenException);
      expect(mockMentorsService.getMentorOptions).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the service returns no mentor', async () => {
      mockMentorsService.getMentorOptions.mockResolvedValue(null);
      const req = createReq({ courses: { [courseId]: { mentorId } } });

      await expect(controller.getMentorOptions(mentorId, courseId, req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMentorStudents', () => {
    it('maps service students into MentorStudentDto and passes the requesting user id', async () => {
      mockMentorsService.getStudents.mockResolvedValue([mockStudentEntity]);
      const req = createReq({ id: 55 });

      const result = await controller.getMentorStudents(mentorId, req);

      expect(mockMentorsService.getStudents).toHaveBeenCalledWith(mentorId, 55);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 1, githubId: 'jane-roe', feedbacks: [] });
    });
  });

  describe('getCourseStudentsCount', () => {
    it('delegates to the service and returns the count verbatim', async () => {
      mockMentorsService.getCourseStudentsCount.mockResolvedValue(12);

      const result = await controller.getCourseStudentsCount(mentorId, courseId);

      expect(mockMentorsService.getCourseStudentsCount).toHaveBeenCalledWith(mentorId, courseId);
      expect(result).toBe(12);
    });
  });

  describe('getMentorDashboardData', () => {
    it('returns the dashboard data from the service unchanged', async () => {
      mockMentorsService.getStudentsTasks.mockResolvedValue(mockDashboard);

      const result = await controller.getMentorDashboardData(mentorId, courseId);

      expect(mockMentorsService.getStudentsTasks).toHaveBeenCalledWith(mentorId, courseId);
      expect(result).toBe(mockDashboard);
    });
  });

  describe('getRandomTask', () => {
    it('delegates to the service and returns the random task', async () => {
      const randomTask = { courseTaskId: 3 };
      mockMentorsService.getRandomTask.mockResolvedValue(randomTask);

      const result = await controller.getRandomTask(mentorId, courseId);

      expect(mockMentorsService.getRandomTask).toHaveBeenCalledWith(mentorId, courseId);
      expect(result).toBe(randomTask);
    });
  });
});
