import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseGuard } from './course.guard';

type GuardUser = {
  isAdmin: boolean;
  courses: Record<number, unknown>;
};

const createContext = (user: Partial<GuardUser>, params: Record<string, unknown> = {}): ExecutionContext =>
  ({
    getArgs: () => [{ user, params }],
  }) as unknown as ExecutionContext;

describe('CourseGuard', () => {
  let guard: CourseGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseGuard],
    }).compile();

    guard = module.get<CourseGuard>(CourseGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('allows admins regardless of course membership', () => {
    const context = createContext({ isAdmin: true, courses: {} }, { courseId: '5' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a non-admin who belongs to the requested course', () => {
    const context = createContext({ isAdmin: false, courses: { 5: { roles: [] } } }, { courseId: '5' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a non-admin who does not belong to the requested course', () => {
    const context = createContext({ isAdmin: false, courses: { 9: { roles: [] } } }, { courseId: '5' });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('denies a non-admin when courseId is missing (NaN lookup)', () => {
    const context = createContext({ isAdmin: false, courses: { 5: { roles: [] } } });

    expect(guard.canActivate(context)).toBe(false);
  });
});
