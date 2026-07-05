import { ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Mocked } from 'vitest';
import { FeedbackGuard } from './cross-check-feedback.guard';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';
import { CourseRole } from '@entities/session';

type GuardUser = {
  isAdmin?: boolean;
  courses: Record<number, { studentId?: number; roles: CourseRole[] }>;
};

const createContext = (user: Partial<GuardUser>, params: Record<string, unknown> = {}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  }) as unknown as ExecutionContext;

describe('FeedbackGuard', () => {
  let guard: FeedbackGuard;
  let courseCrossCheckService: Mocked<CourseCrossCheckService>;
  let courseTasksService: Mocked<CourseTasksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackGuard,
        {
          provide: CourseCrossCheckService,
          useValue: {
            isCrossCheckTask: vi.fn(),
          },
        },
        {
          provide: CourseTasksService,
          useValue: {
            getById: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<FeedbackGuard>(FeedbackGuard);
    courseCrossCheckService = module.get(CourseCrossCheckService);
    courseTasksService = module.get(CourseTasksService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('student vs manager authorization', () => {
    // The authorization check runs synchronously before the async validateTask call,
    // so the guard throws synchronously here rather than returning a rejected promise.
    it('throws UnauthorizedException when the user is neither a student nor a manager', () => {
      const context = createContext(
        { isAdmin: false, courses: { 5: { roles: [CourseRole.Mentor] } } },
        { courseId: '5', courseTaskId: '10' },
      );

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Not a valid student for this course');
      expect(courseTasksService.getById).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the course entry is missing entirely (optional chaining yields undefined)', () => {
      const context = createContext({ isAdmin: false, courses: {} }, { courseId: '5', courseTaskId: '10' });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('proceeds when the user has a studentId for the course (student branch)', async () => {
      courseTasksService.getById.mockResolvedValue({ checker: 'crossCheck' } as never);
      courseCrossCheckService.isCrossCheckTask.mockReturnValue(true);

      const context = createContext(
        { isAdmin: false, courses: { 5: { studentId: 42, roles: [CourseRole.Student] } } },
        { courseId: '5', courseTaskId: '10' },
      );

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(courseTasksService.getById).toHaveBeenCalledWith('10');
    });

    it('proceeds when the user is an admin even without a studentId (isAdmin branch)', async () => {
      courseTasksService.getById.mockResolvedValue({ checker: 'crossCheck' } as never);
      courseCrossCheckService.isCrossCheckTask.mockReturnValue(true);

      const context = createContext(
        { isAdmin: true, courses: { 5: { roles: [] } } },
        { courseId: '5', courseTaskId: '10' },
      );

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('proceeds when the user has the Manager role for the course (manager branch)', async () => {
      courseTasksService.getById.mockResolvedValue({ checker: 'crossCheck' } as never);
      courseCrossCheckService.isCrossCheckTask.mockReturnValue(true);

      const context = createContext(
        { isAdmin: false, courses: { 5: { roles: [CourseRole.Manager] } } },
        { courseId: '5', courseTaskId: '10' },
      );

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('proceeds when the user has both a studentId and is a manager', async () => {
      courseTasksService.getById.mockResolvedValue({ checker: 'crossCheck' } as never);
      courseCrossCheckService.isCrossCheckTask.mockReturnValue(true);

      const context = createContext(
        { isAdmin: false, courses: { 5: { studentId: 7, roles: [CourseRole.Manager] } } },
        { courseId: '5', courseTaskId: '10' },
      );

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });

  describe('validateTask', () => {
    const allowedContext = createContext({ isAdmin: true, courses: {} }, { courseId: '5', courseTaskId: '10' });

    it('throws BadRequestException when the course task is not found (null)', async () => {
      courseTasksService.getById.mockResolvedValue(null as never);

      await expect(guard.canActivate(allowedContext)).rejects.toBeInstanceOf(BadRequestException);
      await expect(guard.canActivate(allowedContext)).rejects.toThrow('not valid student or course task');
      expect(courseCrossCheckService.isCrossCheckTask).not.toHaveBeenCalled();
    });

    it('throws BadRequestException with the not-supported message when the task is not a cross-check task', async () => {
      courseTasksService.getById.mockResolvedValue({ checker: 'auto-test' } as never);
      courseCrossCheckService.isCrossCheckTask.mockReturnValue(false);

      await expect(guard.canActivate(allowedContext)).rejects.toBeInstanceOf(BadRequestException);
      await expect(guard.canActivate(allowedContext)).rejects.toThrow('not supported task');
    });

    it('returns true when the task is found and is a cross-check task', async () => {
      const courseTask = { checker: 'crossCheck' };
      courseTasksService.getById.mockResolvedValue(courseTask as never);
      courseCrossCheckService.isCrossCheckTask.mockReturnValue(true);

      await expect(guard.canActivate(allowedContext)).resolves.toBe(true);
      expect(courseCrossCheckService.isCrossCheckTask).toHaveBeenCalledWith(courseTask);
    });

    it('is callable directly and resolves to true for a valid cross-check task', async () => {
      courseTasksService.getById.mockResolvedValue({ checker: 'crossCheck' } as never);
      courseCrossCheckService.isCrossCheckTask.mockReturnValue(true);

      await expect(guard.validateTask(10)).resolves.toBe(true);
      expect(courseTasksService.getById).toHaveBeenCalledWith(10);
    });
  });
});
