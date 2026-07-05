import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Mocked } from 'vitest';
import { RegisteredStudentOrPowerUserGuard } from './registered-student-guard';
import { TeamDistributionStudentService } from './team-distribution-student.service';
import { CourseRole } from '@entities/session';

type GuardUser = {
  isAdmin?: boolean;
  courses: Record<number, { studentId?: number; roles: CourseRole[] }>;
};

const createContext = (user: Partial<GuardUser>, params: Record<string, unknown> = {}): ExecutionContext =>
  ({
    getArgs: () => [{ user, params }],
  }) as unknown as ExecutionContext;

describe('RegisteredStudentOrPowerUserGuard', () => {
  let guard: RegisteredStudentOrPowerUserGuard;
  let teamDistributionStudentService: Mocked<TeamDistributionStudentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisteredStudentOrPowerUserGuard,
        {
          provide: TeamDistributionStudentService,
          useValue: {
            getTeamDistributionStudent: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RegisteredStudentOrPowerUserGuard>(RegisteredStudentOrPowerUserGuard);
    teamDistributionStudentService = module.get(TeamDistributionStudentService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('power-user bypass', () => {
    it('returns true for an admin without a registration lookup (isAdmin short-circuit)', async () => {
      const context = createContext({ isAdmin: true, courses: {} }, { courseId: '5', id: '3' });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(teamDistributionStudentService.getTeamDistributionStudent).not.toHaveBeenCalled();
    });

    it('returns true for a course Manager (second clause of the || chain)', async () => {
      const context = createContext(
        { isAdmin: false, courses: { 5: { roles: [CourseRole.Manager] } } },
        { courseId: '5', id: '3' },
      );

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(teamDistributionStudentService.getTeamDistributionStudent).not.toHaveBeenCalled();
    });

    it('returns true for a course Dementor (third clause of the || chain)', async () => {
      const context = createContext(
        { isAdmin: false, courses: { 5: { roles: [CourseRole.Dementor] } } },
        { courseId: '5', id: '3' },
      );

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(teamDistributionStudentService.getTeamDistributionStudent).not.toHaveBeenCalled();
    });
  });

  describe('courseId / studentId validation', () => {
    it('throws UnauthorizedException when courseId is missing (NaN -> falsy)', async () => {
      const context = createContext({ isAdmin: false, courses: {} }, { id: '3' });

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(teamDistributionStudentService.getTeamDistributionStudent).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when courseId resolves to 0 (falsy)', async () => {
      const context = createContext({ isAdmin: false, courses: {} }, { courseId: '0', id: '3' });

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the user has a course entry but no studentId', async () => {
      const context = createContext(
        { isAdmin: false, courses: { 5: { roles: [CourseRole.Student] } } },
        { courseId: '5', id: '3' },
      );

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(teamDistributionStudentService.getTeamDistributionStudent).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the course entry is missing so studentId is undefined', async () => {
      const context = createContext({ isAdmin: false, courses: {} }, { courseId: '5', id: '3' });

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('registration status', () => {
    const studentContext = createContext(
      { isAdmin: false, courses: { 5: { studentId: 42, roles: [CourseRole.Student] } } },
      { courseId: '5', id: '3' },
    );

    it('returns true when the registration is active (active && not distributed)', async () => {
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue({
        active: true,
        distributed: false,
      } as never);

      await expect(guard.canActivate(studentContext)).resolves.toBe(true);
      expect(teamDistributionStudentService.getTeamDistributionStudent).toHaveBeenCalledWith(42, 3);
    });

    it('returns true when the registration is distributed but not active', async () => {
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue({
        active: false,
        distributed: true,
      } as never);

      await expect(guard.canActivate(studentContext)).resolves.toBe(true);
    });

    it('returns true when the registration is both active and distributed', async () => {
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue({
        active: true,
        distributed: true,
      } as never);

      await expect(guard.canActivate(studentContext)).resolves.toBe(true);
    });

    it('throws UnauthorizedException when the registration is neither active nor distributed', async () => {
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue({
        active: false,
        distributed: false,
      } as never);

      await expect(guard.canActivate(studentContext)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the registration is nullish (optional chaining yields undefined)', async () => {
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue(null as never);

      await expect(guard.canActivate(studentContext)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('propagates the rejection when the registration lookup fails', async () => {
      const lookupError = new Error('not found');
      teamDistributionStudentService.getTeamDistributionStudent.mockRejectedValue(lookupError);

      await expect(guard.canActivate(studentContext)).rejects.toBe(lookupError);
    });
  });
});
