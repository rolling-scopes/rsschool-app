import { ForbiddenException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseLeaveSurveyResponse } from '@entities/index';
import { CourseStatsController } from './course-stats.controller';
import { CourseStatsService } from './course-stats.service';
import { CourseAccessService } from '../course-access.service';
import { ExpelledStatsService } from '../expelled-stats.service';

const courseId = 7;

const mockCourse = {
  id: courseId,
  alias: 'rs',
  name: 'RS',
  fullName: 'RS School',
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-06-01T00:00:00.000Z'),
  createdDate: new Date('2025-12-01T00:00:00.000Z'),
  updatedDate: new Date('2025-12-02T00:00:00.000Z'),
  discipline: { id: 1, name: 'JS' },
};

const mockExpelledStat = {
  id: 'survey-1',
  course: mockCourse,
  user: { id: 5, githubId: 'john-doe', firstName: 'John', lastName: 'Doe' },
  reasonForLeaving: ['no time'],
  otherComment: 'bye',
  submittedAt: new Date('2026-02-01T00:00:00.000Z'),
} as unknown as CourseLeaveSurveyResponse;

const mockCountries = { countries: [{ countryName: 'Belarus', count: 3 }] };

const mockCourseStatsService = {
  getCoursesStats: vi.fn(),
  getStudents: vi.fn(),
  getMentors: vi.fn(),
  getMentorCountries: vi.fn(),
  getStudentCountries: vi.fn(),
  getStudentsWithCertificatesCountries: vi.fn(),
  getTaskPerformance: vi.fn(),
};

const mockCourseAccessService = {
  getUserAllowedCourseIds: vi.fn(),
  canAccessCourse: vi.fn(),
};

const mockExpelledStatsService = {
  findAll: vi.fn(),
  findByCourseId: vi.fn(),
  remove: vi.fn(),
};

const createReq = (user: Record<string, unknown>) => ({ user }) as never;

describe('CourseStatsController', () => {
  let controller: CourseStatsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseStatsController],
      providers: [
        { provide: CourseStatsService, useValue: mockCourseStatsService },
        { provide: CourseAccessService, useValue: mockCourseAccessService },
        { provide: ExpelledStatsService, useValue: mockExpelledStatsService },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get(CourseStatsController);
  });

  describe('getExpelledStats', () => {
    it('maps every survey response into an ExpelledStatsDto', async () => {
      mockExpelledStatsService.findAll.mockResolvedValue([mockExpelledStat]);

      const result = await controller.getExpelledStats();

      expect(mockExpelledStatsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'survey-1', otherComment: 'bye' });
    });
  });

  describe('getCourseExpelledStats', () => {
    it('fetches survey responses for the course and maps them', async () => {
      mockExpelledStatsService.findByCourseId.mockResolvedValue([mockExpelledStat]);

      const result = await controller.getCourseExpelledStats(courseId);

      expect(mockExpelledStatsService.findByCourseId).toHaveBeenCalledWith(courseId);
      expect(result[0]).toMatchObject({ id: 'survey-1' });
    });
  });

  describe('deleteExpelledStat', () => {
    it('removes the stat by id and returns a success message', async () => {
      const result = await controller.deleteExpelledStat('survey-1');

      expect(mockExpelledStatsService.remove).toHaveBeenCalledWith('survey-1');
      expect(result).toBe('Successfully deleted');
    });
  });

  describe('getCoursesStats', () => {
    it('filters ids through course access then wraps the aggregate stats', async () => {
      const aggregate = {
        studentsCountries: mockCountries,
        studentsStats: { activeStudentsCount: 1 },
        mentorsCountries: mockCountries,
        mentorsStats: { mentorsActiveCount: 2 },
        courseTasks: [],
        studentsCertificatesCountries: mockCountries,
      };
      mockCourseAccessService.getUserAllowedCourseIds.mockResolvedValue([1, 2]);
      mockCourseStatsService.getCoursesStats.mockResolvedValue(aggregate);
      const req = createReq({ id: 1 });

      const result = await controller.getCoursesStats(req, [1, 2, 3], 2026);

      expect(mockCourseAccessService.getUserAllowedCourseIds).toHaveBeenCalledWith({ id: 1 }, [1, 2, 3], 2026);
      expect(mockCourseStatsService.getCoursesStats).toHaveBeenCalledWith([1, 2]);
      expect(result).toMatchObject({ courseTasks: [], studentsStats: { activeStudentsCount: 1 } });
    });
  });

  describe('getCourses', () => {
    it('returns CourseStatsDto when the user can access the course', async () => {
      mockCourseAccessService.canAccessCourse.mockReturnValue(true);
      mockCourseStatsService.getStudents.mockResolvedValue({
        activeStudentsCount: 5,
        totalStudents: 10,
        studentsWithMentorCount: 4,
        certifiedStudentsCount: 2,
        eligibleForCertificationCount: 6,
      });
      const req = createReq({ id: 1 });

      const result = await controller.getCourses(req, courseId);

      expect(mockCourseAccessService.canAccessCourse).toHaveBeenCalledWith({ id: 1 }, courseId);
      expect(mockCourseStatsService.getStudents).toHaveBeenCalledWith(courseId);
      expect(result).toMatchObject({ activeStudentsCount: 5, totalStudents: 10 });
    });

    it('throws ForbiddenException and never queries students when access is denied', async () => {
      mockCourseAccessService.canAccessCourse.mockReturnValue(false);

      await expect(controller.getCourses(createReq({ id: 1 }), courseId)).rejects.toThrow(ForbiddenException);
      expect(mockCourseStatsService.getStudents).not.toHaveBeenCalled();
    });
  });

  describe('getMentors', () => {
    it('wraps mentor stats in a CourseMentorsStatsDto', async () => {
      mockCourseStatsService.getMentors.mockResolvedValue({
        mentorsActiveCount: 3,
        mentorsTotalCount: 5,
        epamMentorsCount: 1,
      });

      const result = await controller.getMentors(courseId);

      expect(mockCourseStatsService.getMentors).toHaveBeenCalledWith(courseId);
      expect(result).toMatchObject({ mentorsActiveCount: 3, mentorsTotalCount: 5, epamMentorsCount: 1 });
    });
  });

  describe('getMentorCountries', () => {
    it('returns the mentor countries stats unchanged', async () => {
      mockCourseStatsService.getMentorCountries.mockResolvedValue(mockCountries);

      const result = await controller.getMentorCountries(courseId);

      expect(mockCourseStatsService.getMentorCountries).toHaveBeenCalledWith(courseId);
      expect(result).toBe(mockCountries);
    });
  });

  describe('getStudentCountries', () => {
    it('returns the student countries stats unchanged', async () => {
      mockCourseStatsService.getStudentCountries.mockResolvedValue(mockCountries);

      const result = await controller.getStudentCountries(courseId);

      expect(mockCourseStatsService.getStudentCountries).toHaveBeenCalledWith(courseId);
      expect(result).toBe(mockCountries);
    });
  });

  describe('getStudentsWithCertificatesCountries', () => {
    it('returns the certified-student countries stats unchanged', async () => {
      mockCourseStatsService.getStudentsWithCertificatesCountries.mockResolvedValue(mockCountries);

      const result = await controller.getStudentsWithCertificatesCountries(courseId);

      expect(mockCourseStatsService.getStudentsWithCertificatesCountries).toHaveBeenCalledWith(courseId);
      expect(result).toBe(mockCountries);
    });
  });

  describe('getTaskPerformance', () => {
    it('wraps the task performance stats in a TaskPerformanceStatsDto', async () => {
      const stats = {
        totalAchievement: 10,
        minimalAchievement: 1,
        lowAchievement: 2,
        moderateAchievement: 3,
        highAchievement: 2,
        exceptionalAchievement: 1,
        perfectScores: 1,
      };
      mockCourseStatsService.getTaskPerformance.mockResolvedValue(stats);

      const result = await controller.getTaskPerformance(courseId, 99);

      expect(mockCourseStatsService.getTaskPerformance).toHaveBeenCalledWith(99);
      expect(result).toMatchObject(stats);
    });
  });
});
