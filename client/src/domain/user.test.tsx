import { CourseRole, Session } from 'components/withSession';
import * as user from './user';

describe('User', () => {
  it('isAdmin', () => {
    expect(user.isAdmin({} as Session)).toBe(false);
    expect(user.isAdmin({ isAdmin: true } as Session)).toBe(true);
  });

  it('isAnyCourseManager', () => {
    expect(user.isAnyCourseManager({ courses: { 1: { roles: [CourseRole.Manager] } } } as any)).toBe(true);
    expect(user.isAnyCourseManager({ courses: { 1: { roles: [CourseRole.Mentor] } } } as any)).toBe(false);
  });

  it('isCourseManager', () => {
    expect(user.isCourseManager({ courses: { 1: { roles: [CourseRole.Manager] } } } as any, 1)).toBe(true);
    expect(user.isCourseManager({ courses: { 2: { roles: [CourseRole.Manager] } } } as any, 1)).toBe(false);
  });

  it('isPowerUser', () => {
    expect(user.isPowerUser({ courses: { 1: { roles: [CourseRole.Manager] } } } as any, 1)).toBe(true);
    expect(user.isPowerUser({ courses: { 1: { roles: [CourseRole.Supervisor] } } } as any, 1)).toBe(true);
    expect(user.isPowerUser({ isAdmin: true } as Session, 0)).toBe(true);
    expect(user.isPowerUser({ courses: { 1: { roles: [CourseRole.Supervisor] } } } as any, 2)).toBe(false);
  });

  it('isAnyMentor', () => {
    expect(user.isAnyMentor({ courses: { 1: { roles: [CourseRole.Mentor] } } } as any)).toBe(true);
    expect(user.isAnyMentor({ courses: { 1: { roles: [] } } } as any)).toBe(false);
  });
});
