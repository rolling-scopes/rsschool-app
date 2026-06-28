import { Session } from '@client/components/withSession';
import { CourseRole } from '@client/services/models';
import * as user from './user';

const base: Session = {
  courses: {},
  githubId: 'test',
  id: 1,
  isAdmin: false,
  isHirer: false,
};

const withCourse = (courseId: number, course: Partial<Session['courses'][number]>): Session => ({
  ...base,
  courses: { [courseId]: course as Session['courses'][number] },
});

describe('user domain helpers', () => {
  describe('isExpelledStudent', () => {
    it('returns true only when isExpelled is exactly true', () => {
      expect(user.isExpelledStudent(withCourse(1, { isExpelled: true }), 1)).toBe(true);
      expect(user.isExpelledStudent(withCourse(1, { isExpelled: false }), 1)).toBe(false);
      expect(user.isExpelledStudent(base, 1)).toBe(false);
    });
  });

  describe('hasRoleInAnyCourse', () => {
    it('returns true if any course has the role', () => {
      expect(user.hasRoleInAnyCourse(withCourse(2, { roles: [CourseRole.Dementor] }), CourseRole.Dementor)).toBe(true);
    });

    it('returns false if no course has the role', () => {
      expect(user.hasRoleInAnyCourse(withCourse(2, { roles: [CourseRole.Student] }), CourseRole.Dementor)).toBe(false);
    });
  });

  describe('isMentor', () => {
    it('is true for a mentor in the course', () => {
      expect(user.isMentor(withCourse(1, { roles: [CourseRole.Mentor] }), 1)).toBe(true);
    });

    it('is false when courseId is falsy (0)', () => {
      expect(user.isMentor(withCourse(1, { roles: [CourseRole.Mentor] }), 0)).toBe(false);
    });

    it('is false when the role is missing', () => {
      expect(user.isMentor(withCourse(1, { roles: [CourseRole.Student] }), 1)).toBe(false);
    });
  });

  describe('getMentorId', () => {
    it('returns the mentorId when present', () => {
      expect(user.getMentorId(withCourse(1, { mentorId: 42 }), 1)).toBe(42);
    });

    it('returns null when the course or mentorId is missing', () => {
      expect(user.getMentorId(base, 1)).toBeNull();
      expect(user.getMentorId(withCourse(1, {}), 1)).toBeNull();
    });
  });

  describe('isStudent / isActiveStudent', () => {
    it('isStudent is true for a student role and a truthy courseId', () => {
      expect(user.isStudent(withCourse(1, { roles: [CourseRole.Student] }), 1)).toBe(true);
      expect(user.isStudent(withCourse(1, { roles: [CourseRole.Student] }), 0)).toBe(false);
    });

    it('isActiveStudent is true for a non-expelled student', () => {
      expect(user.isActiveStudent(withCourse(1, { roles: [CourseRole.Student], isExpelled: false }), 1)).toBe(true);
    });

    it('isActiveStudent is false for an expelled student', () => {
      expect(user.isActiveStudent(withCourse(1, { roles: [CourseRole.Student], isExpelled: true }), 1)).toBe(false);
    });
  });

  describe('isDementor', () => {
    it('is true for an admin', () => {
      expect(user.isDementor({ ...base, isAdmin: true }, 1)).toBe(true);
    });

    it('is true for a dementor role', () => {
      expect(user.isDementor(withCourse(1, { roles: [CourseRole.Dementor] }), 1)).toBe(true);
    });

    it('is false otherwise', () => {
      expect(user.isDementor(withCourse(1, { roles: [CourseRole.Student] }), 1)).toBe(false);
    });
  });

  describe('supervisor helpers', () => {
    it('isCourseSupervisor: admin or supervisor role', () => {
      expect(user.isCourseSupervisor({ ...base, isAdmin: true }, 1)).toBe(true);
      expect(user.isCourseSupervisor(withCourse(1, { roles: [CourseRole.Supervisor] }), 1)).toBe(true);
      expect(user.isCourseSupervisor(withCourse(1, { roles: [] }), 1)).toBe(false);
    });

    it('isAnyCourseSupervisor: admin or supervisor in any course', () => {
      expect(user.isAnyCourseSupervisor({ ...base, isAdmin: true })).toBe(true);
      expect(user.isAnyCourseSupervisor(withCourse(1, { roles: [CourseRole.Supervisor] }))).toBe(true);
      expect(user.isAnyCourseSupervisor(withCourse(1, { roles: [CourseRole.Student] }))).toBe(false);
    });
  });

  describe('isAnyCoursePowerUser', () => {
    it('is true for admin', () => {
      expect(user.isAnyCoursePowerUser({ ...base, isAdmin: true })).toBe(true);
    });

    it('is true for a manager in any course', () => {
      expect(user.isAnyCoursePowerUser(withCourse(1, { roles: [CourseRole.Manager] }))).toBe(true);
    });

    it('is true for a supervisor in any course', () => {
      expect(user.isAnyCoursePowerUser(withCourse(1, { roles: [CourseRole.Supervisor] }))).toBe(true);
    });

    it('is false for a plain student', () => {
      expect(user.isAnyCoursePowerUser(withCourse(1, { roles: [CourseRole.Student] }))).toBe(false);
    });
  });

  describe('isAnyCourseDementor', () => {
    it('is true for admin or a dementor in any course', () => {
      expect(user.isAnyCourseDementor({ ...base, isAdmin: true })).toBe(true);
      expect(user.isAnyCourseDementor(withCourse(1, { roles: [CourseRole.Dementor] }))).toBe(true);
      expect(user.isAnyCourseDementor(withCourse(1, { roles: [CourseRole.Student] }))).toBe(false);
    });
  });

  describe('isTaskOwner', () => {
    it('is true for a task owner role', () => {
      expect(user.isTaskOwner(withCourse(1, { roles: [CourseRole.TaskOwner] }), 1)).toBe(true);
      expect(user.isTaskOwner(withCourse(1, { roles: [CourseRole.Student] }), 1)).toBe(false);
    });
  });

  describe('isHirer', () => {
    it('reflects the session isHirer flag', () => {
      expect(user.isHirer({ ...base, isHirer: true })).toBe(true);
      expect(user.isHirer(base)).toBe(false);
      expect(user.isHirer({} as Session)).toBe(false);
    });
  });

  describe('getFullName', () => {
    it('returns "First Last" when both names are present', () => {
      expect(user.getFullName({ firstName: 'Ada', lastName: 'Lovelace', githubId: 'ada' })).toBe('Ada Lovelace');
    });

    it('falls back to githubId when a name part is missing', () => {
      expect(user.getFullName({ firstName: 'Ada', lastName: null, githubId: 'ada' })).toBe('ada');
      expect(user.getFullName({ firstName: null, lastName: 'Lovelace', githubId: 'ada' })).toBe('ada');
      expect(user.getFullName({ firstName: null, lastName: null, githubId: 'ada' })).toBe('ada');
    });
  });
});
