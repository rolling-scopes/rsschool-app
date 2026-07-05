import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { CourseRole } from '@entities/session';
import { AuthUser, Role } from './auth-user.model';
import type { AuthDetails } from './auth.service';

describe('AuthUser', () => {
  it('creates user with supervisor role', () => {
    const user = new AuthUser({ courseUsers: [{ courseId: 1, isSupervisor: true } as CourseUser] } as AuthDetails);
    expect(user.courses).toStrictEqual({
      1: { roles: [CourseRole.Supervisor] },
    });
  });

  it('creates user with manager role', () => {
    const user = new AuthUser({ courseUsers: [{ courseId: 2, isManager: true } as CourseUser] } as AuthDetails);
    expect(user.courses).toStrictEqual({
      2: { roles: [CourseRole.Manager] },
    });
  });

  describe('constructor identity and defaults', () => {
    it('defaults to non-admin user role, no hirer, empty courses when only id/githubId given', () => {
      const user = new AuthUser({ id: 5, githubId: 'john' } as AuthDetails);

      expect(user.id).toBe(5);
      expect(user.githubId).toBe('john');
      expect(user.isAdmin).toBe(false);
      expect(user.isHirer).toBe(false);
      expect(user.appRoles).toStrictEqual([Role.User]);
      expect(user.roles).toStrictEqual({});
      expect(user.courses).toStrictEqual({});
    });

    it('marks app role as admin when admin flag is set', () => {
      const user = new AuthUser({ id: 1, githubId: 'a' } as AuthDetails, [], true);

      expect(user.isAdmin).toBe(true);
      expect(user.appRoles).toStrictEqual([Role.Admin]);
    });

    it('appends the hirer app role when hirer flag is set', () => {
      const user = new AuthUser({ id: 1, githubId: 'a' } as AuthDetails, [], false, true);

      expect(user.isHirer).toBe(true);
      expect(user.appRoles).toStrictEqual([Role.User, Role.Hirer]);
    });
  });

  describe('student aggregation', () => {
    it('records student role, studentId and roles map', () => {
      const user = new AuthUser({
        students: [{ courseId: 1, id: 42, isExpelled: false }],
      } as AuthDetails);

      expect(user.roles).toStrictEqual({ 1: 'student' });
      expect(user.courses).toStrictEqual({
        1: { roles: [CourseRole.Student], studentId: 42, isExpelled: undefined },
      });
    });

    it('keeps isExpelled flag when the student is expelled', () => {
      const user = new AuthUser({
        students: [{ courseId: 1, id: 42, isExpelled: true }],
      } as AuthDetails);

      expect(user.courses[1]).toStrictEqual({
        roles: [CourseRole.Student],
        studentId: 42,
        isExpelled: true,
      });
    });
  });

  describe('mentor aggregation', () => {
    it('records mentor role and mentorId', () => {
      const user = new AuthUser({
        mentors: [{ courseId: 3, id: 7 }],
      } as AuthDetails);

      expect(user.roles).toStrictEqual({ 3: 'mentor' });
      expect(user.courses).toStrictEqual({
        3: { roles: [CourseRole.Mentor], mentorId: 7 },
      });
    });

    it('merges mentor and student data on the same course (mentor overrides roles map)', () => {
      const user = new AuthUser({
        students: [{ courseId: 1, id: 42, isExpelled: false }],
        mentors: [{ courseId: 1, id: 7 }],
      } as AuthDetails);

      // roles map reflects the last write (mentor)
      expect(user.roles).toStrictEqual({ 1: 'mentor' });
      expect(user.courses[1]).toStrictEqual({
        roles: [CourseRole.Student, CourseRole.Mentor],
        studentId: 42,
        mentorId: 7,
        isExpelled: undefined,
      });
    });
  });

  describe('courseUser role aggregation (manager/supervisor/dementor)', () => {
    it('collects every enabled courseUser role for a course', () => {
      const user = new AuthUser({
        courseUsers: [{ courseId: 9, isManager: true, isSupervisor: true, isDementor: true } as CourseUser],
      } as AuthDetails);

      expect(user.courses[9]?.roles).toStrictEqual([CourseRole.Manager, CourseRole.Supervisor, CourseRole.Dementor]);
    });

    it('ignores courseUsers without any enabled flag', () => {
      const user = new AuthUser({
        courseUsers: [{ courseId: 9, isManager: false, isSupervisor: false, isDementor: false } as CourseUser],
      } as AuthDetails);

      expect(user.courses).toStrictEqual({});
    });

    it('records only the dementor role when only dementor flag is set', () => {
      const user = new AuthUser({
        courseUsers: [{ courseId: 9, isDementor: true } as CourseUser],
      } as AuthDetails);

      expect(user.courses[9]?.roles).toStrictEqual([CourseRole.Dementor]);
    });
  });

  describe('taskOwner aggregation', () => {
    it('adds the taskOwner role from courseTasks', () => {
      const user = new AuthUser({ courseUsers: [] } as unknown as AuthDetails, [{ courseId: 4 } as CourseTask]);

      expect(user.courses[4]?.roles).toStrictEqual([CourseRole.TaskOwner]);
    });

    it('deduplicates the taskOwner role across multiple tasks of the same course', () => {
      const user = new AuthUser({ courseUsers: [] } as unknown as AuthDetails, [
        { courseId: 4 } as CourseTask,
        { courseId: 4 } as CourseTask,
      ]);

      expect(user.courses[4]?.roles).toStrictEqual([CourseRole.TaskOwner]);
    });

    it('appends taskOwner alongside existing student/courseUser roles on the same course', () => {
      const user = new AuthUser(
        {
          students: [{ courseId: 4, id: 42, isExpelled: false }],
          courseUsers: [{ courseId: 4, isManager: true } as CourseUser],
        } as AuthDetails,
        [{ courseId: 4 } as CourseTask],
      );

      expect(user.courses[4]?.roles).toStrictEqual([CourseRole.Student, CourseRole.Manager, CourseRole.TaskOwner]);
    });
  });

  describe('createAdmin', () => {
    it('builds an admin user with empty course data', () => {
      const user = AuthUser.createAdmin();

      expect(user.isAdmin).toBe(true);
      expect(user.isHirer).toBe(false);
      expect(user.id).toBe(0);
      expect(user.githubId).toBe('');
      expect(user.appRoles).toStrictEqual([Role.Admin]);
      expect(user.courses).toStrictEqual({});
      expect(user.roles).toStrictEqual({});
    });
  });
});
