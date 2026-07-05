import { Session } from '@client/components/withSession';
import { CourseRole } from '@client/services/models';
import { ProfileCourseDto } from '@client/api';
import { isExportEnabled } from './isExportEnabled';

const course = { id: 42 } as ProfileCourseDto;

function makeSession(over: Partial<Session> = {}): Session {
  return {
    isAdmin: false,
    isHirer: false,
    courses: {},
    ...over,
  } as Session;
}

describe('isExportEnabled', () => {
  it('returns false when there is no session', () => {
    expect(isExportEnabled({ session: undefined, course })).toBe(false);
  });

  it('enables export for an admin', () => {
    expect(isExportEnabled({ session: makeSession({ isAdmin: true }), course })).toBe(true);
  });

  it('enables export for a hirer', () => {
    expect(isExportEnabled({ session: makeSession({ isHirer: true }), course })).toBe(true);
  });

  it('enables export for a course manager role', () => {
    const session = makeSession({ courses: { 42: { roles: [CourseRole.Manager] } } as never });
    expect(isExportEnabled({ session, course })).toBe(true);
  });

  it('enables export for a course supervisor role', () => {
    const session = makeSession({ courses: { 42: { roles: [CourseRole.Supervisor] } } as never });
    expect(isExportEnabled({ session, course })).toBe(true);
  });

  it('disables export for a plain student with no privileged role', () => {
    const session = makeSession({ courses: { 42: { roles: [CourseRole.Student] } } as never });
    expect(isExportEnabled({ session, course })).toBe(false);
  });

  it('disables export when the course is missing from the session courses map', () => {
    expect(isExportEnabled({ session: makeSession(), course })).toBe(false);
  });
});
