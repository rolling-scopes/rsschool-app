import { CourseRole, IUserSession } from '../../../models';
import { getPermissions, defineRole } from '../permissions';

const mockSession = {
  id: 1,
  githubId: 'githubId',
  isHirer: false,
  isAdmin: false,
  courses: {
    '1': {
      mentorId: 1,
      studentId: 2,
      roles: [],
    },
    '2': {
      mentorId: 1,
      studentId: 2,
      roles: [],
    },
    '11': {
      mentorId: 1,
      studentId: 2,
      roles: [],
    },
  },
} as IUserSession;

describe('getPermissions', () => {
  it('Should be an instance of Function', () => {
    expect(getPermissions).toBeInstanceOf(Function);
  });
  describe('Should return permissions object with all keys equal "false"', () => {
    it('if "isProfileOwner" is "false" and no "role" and "permissions" have passed', () => {
      expect(
        getPermissions({
          isProfileOwner: false,
          isAdmin: false,
        }),
      ).toEqual({
        isProfileVisible: false,
        isMentorStatsVisible: false,
        isStudentStatsVisible: false,
        isStageInterviewFeedbackVisible: false,
        isCoreJsFeedbackVisible: false,
        isConsentsVisible: false,
        isExpellingReasonVisible: false,
      });
    });
  });
  describe('Should return permissions object depends on "role" and "permissions" have passed', () => {
    describe('if "isProfileOwner" is "false"', () => {
      it('"role" is "all" and some "permissions" set with "all" = "true"', () => {
        expect(
          getPermissions({
            isProfileOwner: false,
            isAdmin: false,
            role: 'all',
            permissions: {
              isProfileVisible: { all: true },
              isMentorStatsVisible: { all: true, mentor: true, student: true },
              isStudentStatsVisible: { all: true, student: true },
            },
          }),
        ).toEqual({
          isProfileVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: false,
          isCoreJsFeedbackVisible: false,
          isConsentsVisible: false,
          isExpellingReasonVisible: false,
        });
      });
      it('"role" is "mentor" and some "permissions" set with "mentor" = "true"', () => {
        expect(
          getPermissions({
            isProfileOwner: false,
            isAdmin: false,
            role: 'mentor',
            permissions: {
              isProfileVisible: { all: true },
              isMentorStatsVisible: { all: false, mentor: true, student: true },
              isStudentStatsVisible: { all: false, student: true },
            },
          }),
        ).toEqual({
          isProfileVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: true,
          isCoreJsFeedbackVisible: true,
          isConsentsVisible: false,
          isExpellingReasonVisible: true,
        });
      });
      it('"role" is "student" and some "permissions" set with "student" = "true"', () => {
        expect(
          getPermissions({
            isProfileOwner: false,
            isAdmin: false,
            role: 'student',
            permissions: {
              isProfileVisible: { all: true },
              isMentorStatsVisible: { all: false, mentor: true, student: true },
              isStudentStatsVisible: { all: false, student: true },
            },
          }),
        ).toEqual({
          isProfileVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: false,
          isCoreJsFeedbackVisible: false,
          isConsentsVisible: false,
          isExpellingReasonVisible: false,
        });
      });
      it('"role" is "coursemanager" and some "permissions" set with "coursemanager" = "true"', () => {
        expect(
          getPermissions({
            isProfileOwner: false,
            isAdmin: false,
            role: 'coursemanager',
            permissions: {
              isProfileVisible: { all: true },
              isMentorStatsVisible: { all: false, mentor: true, student: true },
              isStudentStatsVisible: { all: false, student: true },
            },
          }),
        ).toEqual({
          isProfileVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: true,
          isCoreJsFeedbackVisible: true,
          isConsentsVisible: true,
          isExpellingReasonVisible: true,
        });
      });
    });
    describe('if "isProfileOwner" is "true"', () => {
      it('"role" is "all" and all "permissions" set with "all" = "false"', () => {
        expect(
          getPermissions({
            isProfileOwner: true,
            isAdmin: false,
            role: 'all',
            permissions: {
              isProfileVisible: { all: false },
              isMentorStatsVisible: { all: false, mentor: false, student: false },
              isStudentStatsVisible: { all: false, student: false },
            },
          }),
        ).toEqual({
          isProfileVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: false,
          isCoreJsFeedbackVisible: false,
          isConsentsVisible: true,
          isExpellingReasonVisible: false,
        });
      });
    });
  });
});

describe('defineRole', () => {
  it('Should be an instance of Function', () => {
    expect(defineRole).toBeInstanceOf(Function);
  });

  describe('Should return user role', () => {
    it('"student", if user is a student', () => {
      expect(
        defineRole({
          relationsRoles: {
            student: 'dima',
            mentors: ['andrey', 'dasha'],
            interviewers: ['sasha', 'max'],
            stageInterviewers: ['alex'],
            checkers: ['masha', 'ivan'],
          },
          registryCourses: null,
          studentCourses: null,
          session: mockSession,
          userGithubId: 'dima',
        }),
      ).toBe('student');
    });
    it('"mentor", if user is an assigned mentor', () => {
      expect(
        defineRole({
          relationsRoles: {
            student: 'dima',
            mentors: ['andrey', 'dasha'],
            interviewers: ['sasha', 'max'],
            stageInterviewers: ['alex'],
            checkers: ['masha', 'ivan'],
          },
          registryCourses: null,
          studentCourses: null,
          session: mockSession,
          userGithubId: 'andrey',
        }),
      ).toBe('mentor');
    });
    it('"mentor", if user is an interviewer', () => {
      expect(
        defineRole({
          relationsRoles: {
            student: 'dima',
            mentors: ['andrey', 'dasha'],
            interviewers: ['sasha', 'max'],
            stageInterviewers: ['alex'],
            checkers: ['masha', 'ivan'],
          },
          registryCourses: null,
          studentCourses: null,
          session: mockSession,
          userGithubId: 'max',
        }),
      ).toBe('mentor');
    });
    it('"mentor", if user is a stage-interviewer', () => {
      expect(
        defineRole({
          relationsRoles: {
            student: 'dima',
            mentors: ['andrey', 'dasha'],
            interviewers: ['sasha', 'max'],
            stageInterviewers: ['alex'],
            checkers: ['masha', 'ivan'],
          },
          registryCourses: null,
          studentCourses: null,
          session: mockSession,
          userGithubId: 'alex',
        }),
      ).toBe('mentor');
    });
    it('"mentor", if user is assigned for checking a task', () => {
      expect(
        defineRole({
          relationsRoles: {
            student: 'dima',
            mentors: ['andrey', 'dasha'],
            interviewers: ['sasha', 'max'],
            stageInterviewers: ['alex'],
            checkers: ['masha', 'ivan'],
          },
          registryCourses: null,
          studentCourses: null,
          session: mockSession,
          userGithubId: 'masha',
        }),
      ).toBe('mentor');
    });
    it('"coursementor", if user is a mentor at the same course where requested user is a student', () => {
      expect(
        defineRole({
          relationsRoles: null,
          registryCourses: null,
          studentCourses: [{ courseId: 1 }, { courseId: 11 }],
          session: mockSession,
          userGithubId: 'denis',
        }),
      ).toBe('coursementor');
    });
    it('"coursemanager", if user is mentor waiting confirmation and current user is coursemanager', () => {
      expect(
        defineRole({
          relationsRoles: null,
          registryCourses: [{ courseId: 1 }],
          studentCourses: null,
          session: {
            courses: { 1: { roles: [CourseRole.Manager] } },
          } as unknown as IUserSession,
          userGithubId: 'denis',
        }),
      ).toBe('coursemanager');
    });
    it('"all", if user is not a mentor at the same course where requested user is a student', () => {
      expect(
        defineRole({
          relationsRoles: null,
          registryCourses: null,
          studentCourses: [{ courseId: 1 }],
          session: { ...mockSession, courses: { 1: { roles: [] } } },
          userGithubId: 'denis',
        }),
      ).toBe('all');
    });
    it('"all", if user if student has not registered to any course', () => {
      expect(
        defineRole({
          relationsRoles: null,
          registryCourses: null,
          studentCourses: null,
          session: mockSession,
          userGithubId: 'denis',
        }),
      ).toBe('all');
    });
  });
});
