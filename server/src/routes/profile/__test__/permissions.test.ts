import { getPermissions, mergeRoles } from '../permissions';

describe('getPermissions', () => {
  it('Should be an instance of Function', () => {
    expect(getPermissions).toBeInstanceOf(Function);
  });
  describe('Should return permissions object with all keys equal "false"', () => {
    it('if "isProfileOwner" is "false" and no "role" and "permissions" have passed', () => {
      expect(getPermissions({
        isProfileOwner: false,
      })).toEqual({
        isProfileVisible: false,
        isAboutVisible: false,
        isEducationVisible: false,
        isEnglishVisible: false,
        isEmailVisible: false,
        isTelegramVisible: false,
        isSkypeVisible: false,
        isPhoneVisible: false,
        isContactsNotesVisible: false,
        isLinkedInVisible: false,
        isPublicFeedbackVisible: false,
        isMentorStatsVisible: false,
        isStudentStatsVisible: false,
        isStageInterviewFeedbackVisible: false,
        isCoreJsFeedbackVisible: false,
      });
    });
  });
  describe('Should return permissions object depends on "role" and "permissions" have passed', () => {
    describe('if "isProfileOwner" is "false"', () => {
      it('"role" is "all" and some "permissions" set with "all" = "true"', () => {
        expect(getPermissions({
          isProfileOwner: false,
          role: 'all',
          permissions: {
            isProfileVisible: { all: true },
            isAboutVisible: { all: true, mentor: true, student: true },
            isEducationVisible: { all: true, mentor: true, student: true },
            isEnglishVisible: { all: false, student: false },
            isEmailVisible: { all: true, student: true },
            isTelegramVisible: { all: false, student: false },
            isSkypeVisible: { all: true, student: true },
            isPhoneVisible: { all: false, student: false },
            isContactsNotesVisible: { all: true, student: true },
            isLinkedInVisible: { all: false, mentor: false, student: false },
            isPublicFeedbackVisible: { all: true, mentor: true, student: true },
            isMentorStatsVisible: { all: true, mentor: true, student: true },
            isStudentStatsVisible: { all: true, student: true },
          },
        })).toEqual({
          isProfileVisible: true,
          isAboutVisible: true,
          isEducationVisible: true,
          isEnglishVisible: false,
          isEmailVisible: true,
          isTelegramVisible: false,
          isSkypeVisible: true,
          isPhoneVisible: false,
          isContactsNotesVisible: true,
          isLinkedInVisible: false,
          isPublicFeedbackVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: false,
          isCoreJsFeedbackVisible: false,
        });
      });
      it('"role" is "mentor" and some "permissions" set with "mentor" = "true"', () => {
        expect(getPermissions({
          isProfileOwner: false,
          role: 'mentor',
          permissions: {
            isProfileVisible: { all: true },
            isAboutVisible: { all: false, mentor: true, student: false },
            isEducationVisible: { all: false, mentor: false, student: true },
            isEnglishVisible: { all: false, student: false },
            isEmailVisible: { all: false, student: true },
            isTelegramVisible: { all: false, student: false },
            isSkypeVisible: { all: false, student: true },
            isPhoneVisible: { all: false, student: false },
            isContactsNotesVisible: { all: true, student: true },
            isLinkedInVisible: { all: false, mentor: false, student: false },
            isPublicFeedbackVisible: { all: false, mentor: true, student: true },
            isMentorStatsVisible: { all: false, mentor: true, student: true },
            isStudentStatsVisible: { all: false, student: true },
          },
        })).toEqual({
          isProfileVisible: true,
          isAboutVisible: true,
          isEducationVisible: false,
          isEnglishVisible: true,
          isEmailVisible: true,
          isTelegramVisible: true,
          isSkypeVisible: true,
          isPhoneVisible: true,
          isContactsNotesVisible: true,
          isLinkedInVisible: false,
          isPublicFeedbackVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: true,
          isCoreJsFeedbackVisible: true,
        });
      });
      it('"role" is "student" and some "permissions" set with "student" = "true"', () => {
        expect(getPermissions({
          isProfileOwner: false,
          role: 'student',
          permissions: {
            isProfileVisible: { all: true },
            isAboutVisible: { all: false, mentor: true, student: true },
            isEducationVisible: { all: false, mentor: false, student: false },
            isEnglishVisible: { all: false, student: false },
            isEmailVisible: { all: false, student: false },
            isTelegramVisible: { all: false, student: true },
            isSkypeVisible: { all: false, student: true },
            isPhoneVisible: { all: false, student: false },
            isContactsNotesVisible: { all: true, student: true },
            isLinkedInVisible: { all: false, mentor: false, student: false },
            isPublicFeedbackVisible: { all: false, mentor: true, student: true },
            isMentorStatsVisible: { all: false, mentor: true, student: true },
            isStudentStatsVisible: { all: false, student: true },
          },
        })).toEqual({
          isProfileVisible: true,
          isAboutVisible: true,
          isEducationVisible: false,
          isEnglishVisible: false,
          isEmailVisible: false,
          isTelegramVisible: true,
          isSkypeVisible: true,
          isPhoneVisible: false,
          isContactsNotesVisible: true,
          isLinkedInVisible: false,
          isPublicFeedbackVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: false,
          isCoreJsFeedbackVisible: false,
        });
      });
    });
    describe('if "isProfileOwner" is "true"', () => {
      it('"role" is "all" and all "permissions" set with "all" = "false"', () => {
        expect(getPermissions({
          isProfileOwner: true,
          role: 'all',
          permissions: {
            isProfileVisible: { all: false },
            isAboutVisible: { all: false, mentor: false, student: false },
            isEducationVisible: { all: false, mentor: false, student: false },
            isEnglishVisible: { all: false, student: false },
            isEmailVisible: { all: false, student: false },
            isTelegramVisible: { all: false, student: false },
            isSkypeVisible: { all: false, student: false },
            isPhoneVisible: { all: false, student: false },
            isContactsNotesVisible: { all: false, student: false },
            isLinkedInVisible: { all: false, mentor: false, student: false },
            isPublicFeedbackVisible: { all: false, mentor: false, student: false },
            isMentorStatsVisible: { all: false, mentor: false, student: false },
            isStudentStatsVisible: { all: false, student: false },
          },
        })).toEqual({
          isProfileVisible: true,
          isAboutVisible: true,
          isEducationVisible: true,
          isEnglishVisible: true,
          isEmailVisible: true,
          isTelegramVisible: true,
          isSkypeVisible: true,
          isPhoneVisible: true,
          isContactsNotesVisible: true,
          isLinkedInVisible: true,
          isPublicFeedbackVisible: true,
          isMentorStatsVisible: true,
          isStudentStatsVisible: true,
          isStageInterviewFeedbackVisible: false,
          isCoreJsFeedbackVisible: false,
        });
      });
    });
  });
});

describe('mergeRoles', () => {
  it('Should be an instance of Function', () => {
    expect(mergeRoles).toBeInstanceOf(Function);
  });

  describe('Should return user role', () => {
    it('"student", if user is a student', () => {
      expect(mergeRoles({
        relationsRoles: {
          student: 'dima',
          mentors: ['andrey', 'dasha'],
          interviewers: ['sasha', 'max'],
          stageInterviewers: ['alex'],
          checkers: ['masha', 'ivan'],
        },
        studentCourses: null,
        roles: {
          1: 'student',
          2: 'mentor',
          11: 'mentor',
        },
        userGithubId: 'dima',
      })).toBe('student');
    });
    it('"mentor", if user is an assigned mentor', () => {
      expect(mergeRoles({
        relationsRoles: {
          student: 'dima',
          mentors: ['andrey', 'dasha'],
          interviewers: ['sasha', 'max'],
          stageInterviewers: ['alex'],
          checkers: ['masha', 'ivan'],
        },
        studentCourses: null,
        roles: {
          1: 'student',
          2: 'mentor',
          11: 'mentor',
        },
        userGithubId: 'andrey',
      })).toBe('mentor');
    });
    it('"mentor", if user is an interviewer', () => {
      expect(mergeRoles({
        relationsRoles: {
          student: 'dima',
          mentors: ['andrey', 'dasha'],
          interviewers: ['sasha', 'max'],
          stageInterviewers: ['alex'],
          checkers: ['masha', 'ivan'],
        },
        studentCourses: null,
        roles: {
          1: 'student',
          2: 'mentor',
          11: 'mentor',
        },
        userGithubId: 'max',
      })).toBe('mentor');
    });
    it('"mentor", if user is a stage-interviewer', () => {
      expect(mergeRoles({
        relationsRoles: {
          student: 'dima',
          mentors: ['andrey', 'dasha'],
          interviewers: ['sasha', 'max'],
          stageInterviewers: ['alex'],
          checkers: ['masha', 'ivan'],
        },
        studentCourses: null,
        roles: {
          1: 'student',
          2: 'mentor',
          11: 'mentor',
        },
        userGithubId: 'alex',
      })).toBe('mentor');
    });
    it('"mentor", if user is assigned for checking a task', () => {
      expect(mergeRoles({
        relationsRoles: {
          student: 'dima',
          mentors: ['andrey', 'dasha'],
          interviewers: ['sasha', 'max'],
          stageInterviewers: ['alex'],
          checkers: ['masha', 'ivan'],
        },
        studentCourses: null,
        roles: {
          1: 'student',
          2: 'mentor',
          11: 'mentor',
        },
        userGithubId: 'masha',
      })).toBe('mentor');
    });
    it('"coursementor", if user is a mentor at the same course where requested user is a student', () => {
      expect(mergeRoles({
        relationsRoles: {
          student: 'dima',
          mentors: ['andrey', 'dasha'],
          interviewers: ['sasha', 'max'],
          stageInterviewers: ['alex'],
          checkers: ['masha', 'ivan'],
        },
        studentCourses: [
          { courseId: 1 },
          { courseId: 11 },
        ],
        roles: {
          '1': 'student',
          '2': 'mentor',
          '11': 'mentor',
        },
        userGithubId: 'denis',
      })).toBe('coursementor');
    });
  });
});
