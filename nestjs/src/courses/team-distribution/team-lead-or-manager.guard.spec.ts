import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Mocked } from 'vitest';
import { TeamLeadOrCourseManagerGuard } from './team-lead-or-manager.guard';
import { TeamService } from './team.service';
import { CourseRole } from '@entities/session';

type GuardUser = {
  isAdmin?: boolean;
  courses: Record<number, { studentId?: number; roles: CourseRole[] }>;
};

const createContext = (user: Partial<GuardUser>, params: Record<string, unknown> = {}): ExecutionContext =>
  ({
    getArgs: () => [{ user, params }],
  }) as unknown as ExecutionContext;

describe('TeamLeadOrCourseManagerGuard', () => {
  let guard: TeamLeadOrCourseManagerGuard;
  let teamService: Mocked<TeamService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamLeadOrCourseManagerGuard,
        {
          provide: TeamService,
          useValue: {
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<TeamLeadOrCourseManagerGuard>(TeamLeadOrCourseManagerGuard);
    teamService = module.get(TeamService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('courseId validation', () => {
    it('throws UnauthorizedException when courseId is missing (NaN -> falsy)', async () => {
      const context = createContext({ isAdmin: true, courses: {} }, { id: '3' });

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(teamService.findById).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when courseId resolves to 0 (falsy)', async () => {
      const context = createContext({ isAdmin: true, courses: {} }, { courseId: '0', id: '3' });

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when courseId is non-numeric (NaN)', async () => {
      const context = createContext({ isAdmin: true, courses: {} }, { courseId: 'abc', id: '3' });

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('manager bypass', () => {
    it('returns true for an admin (isAdmin short-circuit) without a team lookup', async () => {
      const context = createContext({ isAdmin: true, courses: {} }, { courseId: '5', id: '3' });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(teamService.findById).not.toHaveBeenCalled();
    });

    it('returns true for a course Manager without a team lookup', async () => {
      const context = createContext(
        { isAdmin: false, courses: { 5: { roles: [CourseRole.Manager] } } },
        { courseId: '5', id: '3' },
      );

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(teamService.findById).not.toHaveBeenCalled();
    });

    it('returns true when the course entry is present but isAdmin handles the missing-roles short-circuit', async () => {
      const context = createContext({ isAdmin: true, courses: {} }, { courseId: '5', id: '3' });

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });

  describe('team lead path', () => {
    it('returns true when the user is the team lead (teamLeadId === studentId)', async () => {
      teamService.findById.mockResolvedValue({ teamLeadId: 42 } as never);

      const context = createContext(
        { isAdmin: false, courses: { 5: { studentId: 42, roles: [CourseRole.Student] } } },
        { courseId: '5', id: '3' },
      );

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(teamService.findById).toHaveBeenCalledWith(3);
    });

    it('throws UnauthorizedException when the user is not the team lead', async () => {
      teamService.findById.mockResolvedValue({ teamLeadId: 99 } as never);

      const context = createContext(
        { isAdmin: false, courses: { 5: { studentId: 42, roles: [CourseRole.Student] } } },
        { courseId: '5', id: '3' },
      );

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the user has no studentId for the course (undefined !== teamLeadId)', async () => {
      teamService.findById.mockResolvedValue({ teamLeadId: 42 } as never);

      const context = createContext(
        { isAdmin: false, courses: { 5: { roles: [CourseRole.Student] } } },
        { courseId: '5', id: '3' },
      );

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the course entry is missing so studentId is undefined', async () => {
      teamService.findById.mockResolvedValue({ teamLeadId: 42 } as never);

      const context = createContext({ isAdmin: false, courses: {} }, { courseId: '5', id: '3' });

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('propagates the rejection when findById fails (team not found)', async () => {
      const notFound = new Error('team not found');
      teamService.findById.mockRejectedValue(notFound);

      const context = createContext(
        { isAdmin: false, courses: { 5: { studentId: 42, roles: [CourseRole.Student] } } },
        { courseId: '5', id: '3' },
      );

      await expect(guard.canActivate(context)).rejects.toBe(notFound);
    });
  });
});
