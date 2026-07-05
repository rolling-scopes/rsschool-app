import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import type { Mocked } from 'vitest';
import { RoleGuard } from './role.guard';
import { Role, CourseRole } from './auth-user.model';

type GuardUser = {
  appRoles: Role[];
  courses: Record<number, { roles: CourseRole[] }>;
};

const createContext = (user: Partial<GuardUser>, params: Record<string, unknown> = {}): ExecutionContext =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
    getArgs: () => [{ user, params }],
  }) as unknown as ExecutionContext;

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('allows access when no metadata is set (reflector returns undefined)', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createContext({ appRoles: [Role.User], courses: {} });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when roles array is empty', () => {
    reflector.getAllAndOverride.mockReturnValue({ roles: [], requireCourseMatch: false });

    const context = createContext({ appRoles: [Role.User], courses: {} });

    expect(guard.canActivate(context)).toBe(true);
  });

  describe('app roles', () => {
    it('allows access when the user has a required app role', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [Role.Admin], requireCourseMatch: false });

      const context = createContext({ appRoles: [Role.Admin], courses: {} });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('denies access when the user lacks the required app role and no course roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [Role.Admin], requireCourseMatch: false });

      const context = createContext({ appRoles: [Role.User], courses: {} });

      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('course roles with requireCourseMatch', () => {
    it('allows access when the user has the required role in the matched course', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [CourseRole.Mentor], requireCourseMatch: true });

      const context = createContext(
        { appRoles: [Role.User], courses: { 5: { roles: [CourseRole.Mentor] } } },
        {
          courseId: '5',
        },
      );

      expect(guard.canActivate(context)).toBe(true);
    });

    it('denies access when the user lacks the required role in the matched course', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [CourseRole.Mentor], requireCourseMatch: true });

      const context = createContext(
        { appRoles: [Role.User], courses: { 5: { roles: [CourseRole.Student] } } },
        {
          courseId: '5',
        },
      );

      expect(guard.canActivate(context)).toBe(false);
    });

    it('denies access when the matched course is not in the user courses', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [CourseRole.Mentor], requireCourseMatch: true });

      const context = createContext({ appRoles: [Role.User], courses: {} }, { courseId: '5' });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('denies access when courseId resolves to 0 (falsy)', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [CourseRole.Mentor], requireCourseMatch: true });

      const context = createContext(
        { appRoles: [Role.User], courses: { 0: { roles: [CourseRole.Mentor] } } },
        {
          courseId: '0',
        },
      );

      expect(guard.canActivate(context)).toBe(false);
    });

    it('falls back to any-course check when requireCourseMatch is set but courseId is missing', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [CourseRole.Mentor], requireCourseMatch: true });

      const context = createContext({ appRoles: [Role.User], courses: { 7: { roles: [CourseRole.Mentor] } } });

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('course roles in any course', () => {
    it('allows access when the user has the required role in any course', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [CourseRole.Manager], requireCourseMatch: false });

      const context = createContext({
        appRoles: [Role.User],
        courses: { 1: { roles: [CourseRole.Student] }, 2: { roles: [CourseRole.Manager] } },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('denies access when the user has the role in no course', () => {
      reflector.getAllAndOverride.mockReturnValue({ roles: [CourseRole.Manager], requireCourseMatch: false });

      const context = createContext({
        appRoles: [Role.User],
        courses: { 1: { roles: [CourseRole.Student] } },
      });

      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('combined app and course roles', () => {
    it('short-circuits to true via the app role even when the course role is absent', () => {
      reflector.getAllAndOverride.mockReturnValue({
        roles: [Role.Admin, CourseRole.Mentor],
        requireCourseMatch: false,
      });

      const context = createContext({ appRoles: [Role.Admin], courses: {} });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('falls through to the course role when the app role does not match', () => {
      reflector.getAllAndOverride.mockReturnValue({
        roles: [Role.Admin, CourseRole.Mentor],
        requireCourseMatch: false,
      });

      const context = createContext({ appRoles: [Role.User], courses: { 3: { roles: [CourseRole.Mentor] } } });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('denies access when neither the app role nor the course role matches', () => {
      reflector.getAllAndOverride.mockReturnValue({
        roles: [Role.Admin, CourseRole.Mentor],
        requireCourseMatch: false,
      });

      const context = createContext({ appRoles: [Role.User], courses: { 3: { roles: [CourseRole.Student] } } });

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
