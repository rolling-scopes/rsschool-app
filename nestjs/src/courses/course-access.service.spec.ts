import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Between, In } from 'typeorm';
import { Course, Student } from '@entities/index';
import { AuthUser, CourseRole, Role } from '../auth';
import { CourseAccessService } from './course-access.service';
import { ExpelledStatsService } from './expelled-stats.service';
import { LeaveCourseRequestDto } from './dto';

// --- module-scope fixtures -------------------------------------------------

const SELF_EXPELLED_MARK = 'Self expelled from the course';

// Build a minimal AuthUser-shaped object. We bypass the real constructor and
// just provide the fields the service reads (appRoles, courses, isAdmin).
function makeUser(partial: Partial<AuthUser>): AuthUser {
  return {
    appRoles: [Role.User],
    courses: {},
    isAdmin: false,
    ...partial,
  } as Partial<AuthUser> as AuthUser;
}

const mockStudent = {
  id: 101,
  userId: 5005,
  isExpelled: false,
  expellingReason: null,
} as Partial<Student> as Student;

const mockCourse = {
  id: 77,
  completed: false,
} as Partial<Course> as Course;

const mockLeaveDto = {
  reasonForLeaving: ['too hard'],
  otherComment: 'bye',
} as Partial<LeaveCourseRequestDto> as LeaveCourseRequestDto;

describe('CourseAccessService', () => {
  let service: CourseAccessService;
  let studentRepository: {
    findOneByOrFail: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let courseRepository: {
    find: ReturnType<typeof vi.fn>;
    findOneByOrFail: ReturnType<typeof vi.fn>;
  };
  let expelledStatsService: { submitLeaveSurvey: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    studentRepository = {
      findOneByOrFail: vi.fn(),
      update: vi.fn(),
    };
    courseRepository = {
      find: vi.fn(),
      findOneByOrFail: vi.fn(),
    };
    expelledStatsService = {
      submitLeaveSurvey: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseAccessService,
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Course), useValue: courseRepository },
        { provide: ExpelledStatsService, useValue: expelledStatsService },
      ],
    }).compile();

    service = module.get<CourseAccessService>(CourseAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ------------------------------------------------------------------------
  describe('canAccessCourse', () => {
    it('returns true for an admin regardless of course membership (admin bypass)', async () => {
      const user = makeUser({ appRoles: [Role.Admin], courses: {} });

      await expect(service.canAccessCourse(user, 77)).resolves.toBe(true);
    });

    it('returns true for a non-admin enrolled in the course', async () => {
      const user = makeUser({ appRoles: [Role.User], courses: { 77: { roles: [CourseRole.Student] } } });

      await expect(service.canAccessCourse(user, 77)).resolves.toBe(true);
    });

    it('returns false for a non-admin not enrolled in the course', async () => {
      const user = makeUser({ appRoles: [Role.User], courses: { 77: { roles: [CourseRole.Student] } } });

      await expect(service.canAccessCourse(user, 999)).resolves.toBe(false);
    });

    it('returns true when appRoles is undefined but the user is enrolled', async () => {
      const user = makeUser({ appRoles: undefined, courses: { 77: { roles: [CourseRole.Student] } } });

      await expect(service.canAccessCourse(user, 77)).resolves.toBe(true);
    });

    it('returns false when appRoles is undefined and the user is not enrolled', async () => {
      const user = makeUser({ appRoles: undefined, courses: {} });

      await expect(service.canAccessCourse(user, 77)).resolves.toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  describe('getUserAllowedCourseIds', () => {
    describe('without a year (intersection path)', () => {
      it('returns the intersection of requested ids and the student courses', async () => {
        const user = makeUser({
          appRoles: [Role.User],
          courses: { 1: { roles: [] }, 2: { roles: [] }, 3: { roles: [] } },
        });

        const result = await service.getUserAllowedCourseIds(user, [2, 3, 4], 0);

        expect(result).toEqual([2, 3]);
        expect(courseRepository.find).not.toHaveBeenCalled();
      });

      it('returns an empty array when there is no overlap', async () => {
        const user = makeUser({ appRoles: [Role.User], courses: { 1: { roles: [] } } });

        const result = await service.getUserAllowedCourseIds(user, [2, 3], 0);

        expect(result).toEqual([]);
      });

      it('for an admin intersects the requested ids with themselves (admin path)', async () => {
        const user = makeUser({ appRoles: [Role.Admin], courses: {} });

        const result = await service.getUserAllowedCourseIds(user, [2, 3, 4], 0);

        // admin userCourses == ids, so the intersection is the full list
        expect(result).toEqual([2, 3, 4]);
      });

      it('defaults ids to an empty array when omitted, returning an empty intersection', async () => {
        const user = makeUser({ appRoles: [Role.User], courses: { 1: { roles: [] } } });

        const result = await service.getUserAllowedCourseIds(user, undefined, 0);

        expect(result).toEqual([]);
        expect(courseRepository.find).not.toHaveBeenCalled();
      });
    });

    describe('with a year (repository path)', () => {
      it('for a non-admin queries by date range AND restricts to the user enrolled courses', async () => {
        const user = makeUser({
          appRoles: [Role.User],
          courses: { 10: { roles: [] }, 20: { roles: [] } },
        });
        courseRepository.find.mockResolvedValue([{ id: 10 }, { id: 20 }]);

        const result = await service.getUserAllowedCourseIds(user, [], 2024);

        expect(result).toEqual([10, 20]);
        expect(courseRepository.find).toHaveBeenCalledWith({
          where: {
            startDate: Between(new Date('2024'), new Date('2025')),
            id: In([10, 20]),
          },
          select: ['id'],
        });
      });

      it('for an admin queries only by the date range without an id restriction', async () => {
        const user = makeUser({ appRoles: [Role.Admin], courses: {} });
        courseRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

        const result = await service.getUserAllowedCourseIds(user, [], 2024);

        expect(result).toEqual([1, 2, 3]);
        // condition must NOT contain an `id` key for admins
        expect(courseRepository.find).toHaveBeenCalledWith({
          where: {
            startDate: Between(new Date('2024'), new Date('2025')),
          },
          select: ['id'],
        });
        const [[arg]] = courseRepository.find.mock.calls;
        expect(arg.where).not.toHaveProperty('id');
      });

      it('builds the date range from year (start) to year+1 (end)', async () => {
        const user = makeUser({ appRoles: [Role.Admin], courses: {} });
        courseRepository.find.mockResolvedValue([]);

        await service.getUserAllowedCourseIds(user, [], 2030);

        const [[arg]] = courseRepository.find.mock.calls;
        // Between encodes the boundaries as _value: [start, end]
        const range = arg.where.startDate as { _value: [Date, Date] };
        expect(range._value[0]).toEqual(new Date('2030'));
        expect(range._value[1]).toEqual(new Date('2031'));
      });

      it('returns an empty array when the repository finds no matching courses', async () => {
        const user = makeUser({ appRoles: [Role.Admin], courses: {} });
        courseRepository.find.mockResolvedValue([]);

        const result = await service.getUserAllowedCourseIds(user, [], 2024);

        expect(result).toEqual([]);
      });

      it('maps the result rows down to their ids', async () => {
        const user = makeUser({ appRoles: [Role.Admin], courses: {} });
        courseRepository.find.mockResolvedValue([{ id: 42, name: 'ignored' }]);

        const result = await service.getUserAllowedCourseIds(user, [], 2024);

        expect(result).toEqual([42]);
      });
    });
  });

  // ------------------------------------------------------------------------
  describe('canAccessCourseAsManager', () => {
    it('returns true when the user has the Manager role for the course', () => {
      const user = makeUser({
        isAdmin: false,
        courses: { 77: { roles: [CourseRole.Manager] } },
      });

      expect(service.canAccessCourseAsManager(user, 77)).toBe(true);
    });

    it('returns true for an admin even without the Manager role', () => {
      const user = makeUser({
        isAdmin: true,
        courses: { 77: { roles: [CourseRole.Student] } },
      });

      expect(service.canAccessCourseAsManager(user, 77)).toBe(true);
    });

    it('returns false when the user is enrolled but is neither a manager nor an admin', () => {
      const user = makeUser({
        isAdmin: false,
        courses: { 77: { roles: [CourseRole.Student] } },
      });

      expect(service.canAccessCourseAsManager(user, 77)).toBe(false);
    });

    it('returns false (undefined coalesces to isAdmin) when the user is not enrolled and not admin', () => {
      const user = makeUser({ isAdmin: false, courses: {} });

      // courses[courseId]?.roles -> undefined, `undefined || false` -> false
      expect(service.canAccessCourseAsManager(user, 77)).toBe(false);
    });

    it('returns true when the user is not enrolled but is an admin', () => {
      const user = makeUser({ isAdmin: true, courses: {} });

      expect(service.canAccessCourseAsManager(user, 77)).toBe(true);
    });
  });

  // ------------------------------------------------------------------------
  describe('leaveAsStudent', () => {
    it('expels the student, records the self-expel reason and submits the leave survey', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({ ...mockStudent });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });

      await service.leaveAsStudent(77, 101, mockLeaveDto);

      expect(studentRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 101 });
      expect(courseRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 77 });
      expect(studentRepository.update).toHaveBeenCalledWith(
        101,
        expect.objectContaining({
          mentorId: null,
          isExpelled: true,
          expellingReason: `${SELF_EXPELLED_MARK}. bye`,
          endDate: expect.any(Date),
        }),
      );
      expect(expelledStatsService.submitLeaveSurvey).toHaveBeenCalledWith(5005, 77, ['too hard'], 'bye');
    });

    it('falls back to an empty comment in the reason when otherComment is missing', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({ ...mockStudent });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });

      await service.leaveAsStudent(77, 101, { reasonForLeaving: ['x'] } as LeaveCourseRequestDto);

      expect(studentRepository.update).toHaveBeenCalledWith(
        101,
        expect.objectContaining({ expellingReason: `${SELF_EXPELLED_MARK}. ` }),
      );
    });

    it('throws BadRequestException when the course is already completed', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({ ...mockStudent });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse, completed: true });

      await expect(service.leaveAsStudent(77, 101, mockLeaveDto)).rejects.toThrow(
        new BadRequestException('Course is already completed'),
      );
      expect(studentRepository.update).not.toHaveBeenCalled();
      expect(expelledStatsService.submitLeaveSurvey).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the student is already expelled', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({ ...mockStudent, isExpelled: true });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });

      await expect(service.leaveAsStudent(77, 101, mockLeaveDto)).rejects.toThrow(
        new BadRequestException('Student is not active'),
      );
      expect(studentRepository.update).not.toHaveBeenCalled();
      expect(expelledStatsService.submitLeaveSurvey).not.toHaveBeenCalled();
    });

    it('propagates the rejection when the student is not found', async () => {
      const err = new Error('student not found');
      studentRepository.findOneByOrFail.mockRejectedValue(err);
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });

      await expect(service.leaveAsStudent(77, 101, mockLeaveDto)).rejects.toThrow(err);
    });
  });

  // ------------------------------------------------------------------------
  describe('rejoinAsStudent', () => {
    const selfExpelledStudent = {
      ...mockStudent,
      isExpelled: true,
      expellingReason: `${SELF_EXPELLED_MARK}. changed my mind`,
    } as Partial<Student> as Student;

    it('re-joins a self-expelled student and resets the expel fields', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({ ...selfExpelledStudent });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });

      await service.rejoinAsStudent(77, 101);

      expect(studentRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 101 });
      expect(courseRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 77 });
      expect(studentRepository.update).toHaveBeenCalledWith(101, {
        isExpelled: false,
        expellingReason: 'Re-joined course',
        endDate: null,
      });
    });

    it('throws BadRequestException when the course is already completed', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({ ...selfExpelledStudent });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse, completed: true });

      await expect(service.rejoinAsStudent(77, 101)).rejects.toThrow(
        new BadRequestException('Course is already completed'),
      );
      expect(studentRepository.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the student is still active (not expelled)', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({ ...selfExpelledStudent, isExpelled: false });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });

      await expect(service.rejoinAsStudent(77, 101)).rejects.toThrow(new BadRequestException('Student is active'));
      expect(studentRepository.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the student was expelled by someone else (not self)', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({
        ...selfExpelledStudent,
        expellingReason: 'Expelled by mentor for inactivity',
      });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });

      await expect(service.rejoinAsStudent(77, 101)).rejects.toThrow(
        new BadRequestException('Student is not expelled by self'),
      );
      expect(studentRepository.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the expelling reason is null', async () => {
      studentRepository.findOneByOrFail.mockResolvedValue({
        ...selfExpelledStudent,
        expellingReason: null,
      });
      courseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });

      await expect(service.rejoinAsStudent(77, 101)).rejects.toThrow(
        new BadRequestException('Student is not expelled by self'),
      );
      expect(studentRepository.update).not.toHaveBeenCalled();
    });

    it('propagates the rejection when the course is not found', async () => {
      const err = new Error('course not found');
      studentRepository.findOneByOrFail.mockResolvedValue({ ...selfExpelledStudent });
      courseRepository.findOneByOrFail.mockRejectedValue(err);

      await expect(service.rejoinAsStudent(77, 101)).rejects.toThrow(err);
    });
  });
});
