import { Session } from 'components/withSession';
import { CourseRole } from 'services/models';
import * as user from './user';

const mockSession: Session = {
  courses: {},
  githubId: 'test',
  id: 1,
  isAdmin: false,
  isHirer: false,
};

describe('User', () => {
  it('isAdmin', () => {
    expect(user.isAdmin({} as Session)).toBe(false);
    expect(user.isAdmin({ isAdmin: true } as Session)).toBe(true);
  });

  it('isAnyCourseManager', () => {
    expect(user.isAnyCourseManager({ ...mockSession, courses: { 1: { roles: [CourseRole.Manager] } } })).toBe(true);
    expect(user.isAnyCourseManager({ ...mockSession, courses: { 1: { roles: [CourseRole.Mentor] } } })).toBe(false);
  });

  it('isCourseManager', () => {
    expect(user.isCourseManager({ ...mockSession, courses: { 1: { roles: [CourseRole.Manager] } } }, 1)).toBe(true);
    expect(user.isCourseManager({ ...mockSession, courses: { 2: { roles: [CourseRole.Manager] } } }, 1)).toBe(false);
  });

  it('isPowerUser', () => {
    expect(user.isPowerUser({ ...mockSession, courses: { 1: { roles: [CourseRole.Manager] } } }, 1)).toBe(true);
    expect(user.isPowerUser({ ...mockSession, courses: { 1: { roles: [CourseRole.Supervisor] } } }, 1)).toBe(true);
    expect(user.isPowerUser({ ...mockSession, isAdmin: true } as Session, 0)).toBe(true);
    expect(user.isPowerUser({ ...mockSession, courses: { 1: { roles: [CourseRole.Supervisor] } } }, 2)).toBe(false);
  });

  it('isAnyMentor', () => {
    expect(user.isAnyMentor({ ...mockSession, courses: { 1: { roles: [CourseRole.Mentor] } } })).toBe(true);
    expect(user.isAnyMentor({ ...mockSession, courses: { 1: { roles: [] } } })).toBe(false);
  });
});
