import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseStudentsController } from './course-students.controller';
import { CourseStudentsService } from './course-students.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';

const courseId = 5;
const githubId = 'john-doe';

const service = {
  getStudentByGithubId: vi.fn(),
  getStudentScore: vi.fn(),
  getMentorWithContacts: vi.fn(),
  getStudentsWithDetails: vi.fn(),
  searchCourseStudents: vi.fn(),
  getStudentsForCsv: vi.fn(),
  expelStudents: vi.fn(),
};

const createRes = () => ({ setHeader: vi.fn(), end: vi.fn() });

describe('CourseStudentsController read/list/csv/expel routes', () => {
  let controller: CourseStudentsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseStudentsController],
      providers: [
        { provide: CourseStudentsService, useValue: service },
        { provide: UserNotificationsService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CourseStudentsController);
  });

  describe('getStudentSummary', () => {
    it('throws NotFoundException when the student does not exist', async () => {
      service.getStudentByGithubId.mockResolvedValue(null);

      await expect(controller.getStudentSummary(courseId, githubId)).rejects.toThrow(NotFoundException);
      expect(service.getStudentScore).not.toHaveBeenCalled();
    });

    it('builds a summary with score and mentor when the student has a mentor', async () => {
      service.getStudentByGithubId.mockResolvedValue({ id: 42, mentorId: 9, isExpelled: false, isFailed: false });
      service.getStudentScore.mockResolvedValue({ totalScore: 120, results: [], rank: 3 });
      const mentor = { githubId: 'mentor-x', name: 'Mentor X' };
      service.getMentorWithContacts.mockResolvedValue(mentor);

      const result = await controller.getStudentSummary(courseId, githubId);

      expect(service.getStudentScore).toHaveBeenCalledWith(42);
      expect(service.getMentorWithContacts).toHaveBeenCalledWith(9);
      expect(result).toMatchObject({ totalScore: 120, rank: 3, isActive: true, mentor });
    });

    it('omits mentor lookup and marks inactive when the student is expelled without a mentor', async () => {
      service.getStudentByGithubId.mockResolvedValue({ id: 42, mentorId: null, isExpelled: true, isFailed: false });
      service.getStudentScore.mockResolvedValue(undefined);

      const result = await controller.getStudentSummary(courseId, githubId);

      expect(service.getMentorWithContacts).not.toHaveBeenCalled();
      // falls back to DTO defaults when score is missing
      expect(result).toMatchObject({ totalScore: 0, rank: 999999, isActive: false, mentor: null });
    });
  });

  describe('getCourseStudentsWithDetails', () => {
    it('requests active-only students when status query is "active"', async () => {
      service.getStudentsWithDetails.mockResolvedValue(['s1']);

      const result = await controller.getCourseStudentsWithDetails(courseId, 'active');

      expect(service.getStudentsWithDetails).toHaveBeenCalledWith(courseId, true);
      expect(result).toEqual(['s1']);
    });

    it('requests all students when status query is absent', async () => {
      service.getStudentsWithDetails.mockResolvedValue([]);

      await controller.getCourseStudentsWithDetails(courseId);

      expect(service.getStudentsWithDetails).toHaveBeenCalledWith(courseId, false);
    });
  });

  describe('searchCourseStudents', () => {
    it('passes the without-mentor flag as true only for the literal "true" query', async () => {
      service.searchCourseStudents.mockResolvedValue(['s']);

      await controller.searchCourseStudents(courseId, 'jane', 'true');

      expect(service.searchCourseStudents).toHaveBeenCalledWith(courseId, 'jane', true);
    });

    it('defaults the without-mentor flag to false when the query is missing', async () => {
      service.searchCourseStudents.mockResolvedValue([]);

      await controller.searchCourseStudents(courseId, 'jane');

      expect(service.searchCourseStudents).toHaveBeenCalledWith(courseId, 'jane', false);
    });
  });

  describe('getCourseStudentsCsv', () => {
    it('streams a CSV attachment built from the service rows', async () => {
      service.getStudentsForCsv.mockResolvedValue([{ githubId: 'john-doe', totalScore: 10 }]);
      const res = createRes();

      await controller.getCourseStudentsCsv(courseId, res as never, 'active');

      expect(service.getStudentsForCsv).toHaveBeenCalledWith(courseId, true);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=students.csv');
      expect(res.end).toHaveBeenCalledTimes(1);
      const csv = res.end.mock.calls[0][0] as string;
      expect(csv).toContain('"githubId"');
      expect(csv).toContain('john-doe');
    });

    it('requests all students when status query is absent', async () => {
      service.getStudentsForCsv.mockResolvedValue([{ githubId: 'a', totalScore: 1 }]);

      await controller.getCourseStudentsCsv(courseId, createRes() as never);

      expect(service.getStudentsForCsv).toHaveBeenCalledWith(courseId, false);
    });
  });

  describe('expelStudents', () => {
    it('delegates to the service with the courseId and dto', async () => {
      service.expelStudents.mockResolvedValue({ expelled: 3 });
      const dto = { expellingReason: 'cheating' } as never;

      const result = await controller.expelStudents(courseId, dto);

      expect(service.expelStudents).toHaveBeenCalledWith({ courseId, expelStatusDto: dto });
      expect(result).toEqual({ expelled: 3 });
    });
  });
});
