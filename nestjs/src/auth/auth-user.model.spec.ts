import { CourseUser } from '@entities/courseUser';
import { CourseRole } from '@entities/session';
import { AuthUser } from './auth-user.model';
import { AuthDetails } from './auth.repository';

describe('AuthUser', () => {
  it('creates user with supervisor role', () => {
    const user = new AuthUser({ courseUsers: [{ courseId: 1, isSupervisor: true } as CourseUser] } as AuthDetails);
    expect(user.courses).toStrictEqual({
      1: { mentorId: null, studentId: null, roles: [CourseRole.Supervisor] },
    });
  });

  it('creates user with manager role', () => {
    const user = new AuthUser({ courseUsers: [{ courseId: 2, isManager: true } as CourseUser] } as AuthDetails);
    expect(user.courses).toStrictEqual({
      2: { mentorId: null, studentId: null, roles: [CourseRole.Manager] },
    });
  });
});
