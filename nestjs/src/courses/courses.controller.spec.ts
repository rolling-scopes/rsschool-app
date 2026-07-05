import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Course } from '@entities/course';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseAccessService } from './course-access.service';
import { CourseScheduleService } from './course-schedule/course-schedule.service';

// A fully-populated Course so `new CourseDto(course)` does not blow up on date fields.
const mockCourse = {
  id: 42,
  alias: 'rs-2026',
  name: 'RS School 2026',
  fullName: 'Rolling Scopes School 2026',
  descriptionUrl: 'https://example.com',
  description: 'desc',
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-06-01T00:00:00.000Z'),
  completed: false,
  planned: true,
  certificateIssuer: 'RS',
  createdDate: new Date('2025-12-01T00:00:00.000Z'),
  updatedDate: new Date('2025-12-02T00:00:00.000Z'),
  locationName: 'Online',
  discordServerId: 1,
  inviteOnly: false,
  registrationEndDate: null,
  personalMentoring: false,
  personalMentoringStartDate: null,
  personalMentoringEndDate: null,
  logo: 'logo.png',
  discipline: { id: 3, name: 'JS' },
  minStudentsPerMentor: 2,
  certificateThreshold: 50,
  wearecommunityUrl: null,
  certificateDisciplines: ['3', '4'],
} as unknown as Course;

const mockCoursesService = {
  getAll: vi.fn(),
  create: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
};

const mockCourseAccessService = {
  canAccessCourseAsManager: vi.fn(),
  leaveAsStudent: vi.fn(),
  rejoinAsStudent: vi.fn(),
};

const mockCourseScheduleService = {
  copyFromTo: vi.fn(),
};

const createReq = (user: Record<string, unknown>) => ({ user }) as never;

describe('CoursesController', () => {
  let controller: CoursesController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: mockCoursesService },
        { provide: CourseAccessService, useValue: mockCourseAccessService },
        { provide: CourseScheduleService, useValue: mockCourseScheduleService },
      ],
    }).compile();

    controller = module.get(CoursesController);
  });

  describe('getCourses', () => {
    it('maps every course returned by the service into a CourseDto', async () => {
      mockCoursesService.getAll.mockResolvedValue([mockCourse]);

      const result = await controller.getCourses();

      expect(mockCoursesService.getAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 42, alias: 'rs-2026', name: 'RS School 2026' });
    });

    it('returns an empty list when there are no courses', async () => {
      mockCoursesService.getAll.mockResolvedValue([]);

      const result = await controller.getCourses();

      expect(result).toEqual([]);
    });
  });

  describe('createCourse', () => {
    it('creates the course and wraps the result in a CourseDto', async () => {
      mockCoursesService.create.mockResolvedValue(mockCourse);
      const dto = { name: 'RS School 2026' } as never;

      const result = await controller.createCourse(dto);

      expect(mockCoursesService.create).toHaveBeenCalledWith(dto);
      expect(result).toMatchObject({ id: 42 });
    });
  });

  describe('getCourse', () => {
    it('fetches the course by id and wraps it in a CourseDto', async () => {
      mockCoursesService.getById.mockResolvedValue(mockCourse);

      const result = await controller.getCourse(createReq({}), 42);

      expect(mockCoursesService.getById).toHaveBeenCalledWith(42);
      expect(result).toMatchObject({ id: 42 });
    });
  });

  describe('updateCourse', () => {
    it('updates and wraps the course when the user is a course manager', async () => {
      mockCourseAccessService.canAccessCourseAsManager.mockReturnValue(true);
      mockCoursesService.update.mockResolvedValue(mockCourse);
      const req = createReq({ id: 1 });
      const update = { name: 'New name' } as never;

      const result = await controller.updateCourse(req, 42, update);

      expect(mockCourseAccessService.canAccessCourseAsManager).toHaveBeenCalledWith({ id: 1 }, 42);
      expect(mockCoursesService.update).toHaveBeenCalledWith(42, update);
      expect(result).toMatchObject({ id: 42 });
    });

    it('throws ForbiddenException and never updates when access is denied', async () => {
      mockCourseAccessService.canAccessCourseAsManager.mockReturnValue(false);

      await expect(controller.updateCourse(createReq({ id: 1 }), 42, {} as never)).rejects.toThrow(
        new ForbiddenException('No access to edit course'),
      );
      expect(mockCoursesService.update).not.toHaveBeenCalled();
    });
  });

  describe('leaveCourse', () => {
    it('leaves the course using the studentId resolved from the session', async () => {
      const req = createReq({ courses: { 42: { studentId: 7 } } });
      const dto = { reason: 'no time' } as never;

      await controller.leaveCourse(req, 42, dto);

      expect(mockCourseAccessService.leaveAsStudent).toHaveBeenCalledWith(42, 7, dto);
    });

    it('does nothing when the user is not a student in the course', async () => {
      await controller.leaveCourse(createReq({ courses: {} }), 42, {} as never);

      expect(mockCourseAccessService.leaveAsStudent).not.toHaveBeenCalled();
    });
  });

  describe('rejoinCourse', () => {
    it('rejoins the course using the studentId resolved from the session', async () => {
      const req = createReq({ courses: { 42: { studentId: 7 } } });

      await controller.rejoinCourse(req, 42);

      expect(mockCourseAccessService.rejoinAsStudent).toHaveBeenCalledWith(42, 7);
    });

    it('does nothing when the user is not a student in the course', async () => {
      await controller.rejoinCourse(createReq({ courses: {} }), 42);

      expect(mockCourseAccessService.rejoinAsStudent).not.toHaveBeenCalled();
    });
  });

  describe('copyCourse', () => {
    it('creates a copy, copies the schedule, then returns the freshly fetched course', async () => {
      const created = { ...mockCourse, id: 99 } as Course;
      mockCoursesService.create.mockResolvedValue(created);
      mockCoursesService.getById.mockResolvedValue(created);
      const body = { name: 'Copy' } as never;

      const result = await controller.copyCourse(42, body);

      expect(mockCoursesService.create).toHaveBeenCalledWith(body);
      expect(mockCourseScheduleService.copyFromTo).toHaveBeenCalledWith(42, 99);
      expect(mockCoursesService.getById).toHaveBeenCalledWith(99);
      expect(result).toMatchObject({ id: 99 });
    });

    it('skips schedule copy when the created course has no id', async () => {
      const created = { ...mockCourse, id: undefined } as unknown as Course;
      mockCoursesService.create.mockResolvedValue(created);
      mockCoursesService.getById.mockResolvedValue(mockCourse);

      await controller.copyCourse(42, {} as never);

      expect(mockCourseScheduleService.copyFromTo).not.toHaveBeenCalled();
      expect(mockCoursesService.getById).toHaveBeenCalledWith(undefined);
    });
  });
});
