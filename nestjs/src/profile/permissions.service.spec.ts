import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionsService, Relations } from './permissions.service';
import { CourseRole, IUserSession, ProfilePermissions, Student } from '@entities/index';

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: getRepositoryToken(ProfilePermissions), useValue: {} },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('getAccessRights', () => {
    it(`should return object with all falsy values if no permissions are provided 
    and requestor with unknown role is neither an admin nor a profile owner`, () => {
      expect(
        service.getAccessRights({
          isProfileOwner: false,
          isAdmin: false,
        }),
      ).toEqual({
        isProfileVisible: false,
        isAboutVisible: false,
        isEducationVisible: false,
        isEnglishVisible: false,
        isEmailVisible: false,
        isTelegramVisible: false,
        isWhatsAppVisible: false,
        isSkypeVisible: false,
        isPhoneVisible: false,
        isContactsNotesVisible: false,
        isLinkedInVisible: false,
        isPublicFeedbackVisible: false,
        isMentorStatsVisible: false,
        isStudentStatsVisible: false,
        isStageInterviewFeedbackVisible: false,
        isCoreJsFeedbackVisible: false,
        isConsentsVisible: false,
        isExpellingReasonVisible: false,
      });
    });

    describe('role and permissions are provided', () => {
      describe('requestor is a profile owner', () => {
        it('should return object with values relevant to role "all"', () => {
          expect(
            service.getAccessRights({
              isProfileOwner: false,
              isAdmin: false,
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
            }),
          ).toEqual({
            isProfileVisible: true,
            isAboutVisible: true,
            isEducationVisible: true,
            isEnglishVisible: false,
            isEmailVisible: true,
            isTelegramVisible: false,
            isWhatsAppVisible: false,
            isSkypeVisible: true,
            isPhoneVisible: false,
            isContactsNotesVisible: true,
            isLinkedInVisible: false,
            isPublicFeedbackVisible: true,
            isMentorStatsVisible: true,
            isStudentStatsVisible: true,
            isStageInterviewFeedbackVisible: false,
            isCoreJsFeedbackVisible: false,
            isConsentsVisible: false,
            isExpellingReasonVisible: false,
          });
        });

        it('should return object with values relevant to role "mentor"', () => {
          expect(
            service.getAccessRights({
              isProfileOwner: false,
              isAdmin: false,
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
            }),
          ).toEqual({
            isProfileVisible: true,
            isAboutVisible: true,
            isEducationVisible: false,
            isEnglishVisible: true,
            isEmailVisible: true,
            isTelegramVisible: true,
            isWhatsAppVisible: true,
            isSkypeVisible: true,
            isPhoneVisible: true,
            isContactsNotesVisible: true,
            isLinkedInVisible: false,
            isPublicFeedbackVisible: true,
            isMentorStatsVisible: true,
            isStudentStatsVisible: true,
            isStageInterviewFeedbackVisible: true,
            isCoreJsFeedbackVisible: true,
            isConsentsVisible: false,
            isExpellingReasonVisible: true,
          });
        });

        it('should return object with values relevant to role "student"', () => {
          expect(
            service.getAccessRights({
              isProfileOwner: false,
              isAdmin: false,
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
            }),
          ).toEqual({
            isProfileVisible: true,
            isAboutVisible: true,
            isEducationVisible: false,
            isEnglishVisible: false,
            isEmailVisible: false,
            isTelegramVisible: true,
            isWhatsAppVisible: true,
            isSkypeVisible: true,
            isPhoneVisible: false,
            isContactsNotesVisible: true,
            isLinkedInVisible: false,
            isPublicFeedbackVisible: true,
            isMentorStatsVisible: true,
            isStudentStatsVisible: true,
            isStageInterviewFeedbackVisible: false,
            isCoreJsFeedbackVisible: false,
            isConsentsVisible: false,
            isExpellingReasonVisible: false,
          });
        });

        it('should return object with values relevant to role "coursemanager"', () => {
          expect(
            service.getAccessRights({
              isProfileOwner: false,
              isAdmin: false,
              role: 'coursemanager',
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
            }),
          ).toEqual({
            isProfileVisible: true,
            isAboutVisible: true,
            isEducationVisible: true,
            isEnglishVisible: true,
            isEmailVisible: true,
            isTelegramVisible: true,
            isWhatsAppVisible: true,
            isSkypeVisible: true,
            isPhoneVisible: true,
            isContactsNotesVisible: true,
            isLinkedInVisible: true,
            isPublicFeedbackVisible: true,
            isMentorStatsVisible: true,
            isStudentStatsVisible: true,
            isStageInterviewFeedbackVisible: true,
            isCoreJsFeedbackVisible: true,
            isConsentsVisible: true,
            isExpellingReasonVisible: true,
          });
        });
      });

      describe('requestor is a profile owner', () => {
        it('should return object with values relevant to role "all" with restrictive role permissions', () => {
          expect(
            service.getAccessRights({
              isProfileOwner: true,
              isAdmin: false,
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
            }),
          ).toEqual({
            isProfileVisible: true,
            isAboutVisible: true,
            isEducationVisible: true,
            isEnglishVisible: true,
            isEmailVisible: true,
            isTelegramVisible: true,
            isWhatsAppVisible: true,
            isSkypeVisible: true,
            isPhoneVisible: true,
            isContactsNotesVisible: true,
            isLinkedInVisible: true,
            isPublicFeedbackVisible: true,
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
    let mockUserSession: IUserSession;
    let mockRoles: Relations;

    beforeEach(() => {
      mockUserSession = {
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
      };

      mockRoles = {
        student: 'dima',
        mentors: ['andrey', 'dasha'],
        interviewers: ['sasha', 'max'],
        stageInterviewers: ['alex'],
        checkers: ['masha', 'ivan'],
      };
    });

    it('should return "student" if user is a student', () => {
      expect(
        service.defineRole({
          relationsRoles: mockRoles,
          mentorRegistryCourses: null,
          studentCourses: null,
          userSession: mockUserSession,
          userGithubId: 'dima',
        }),
      ).toBe('student');
    });

    it('should return "mentor" if user is an assigned mentor', () => {
      expect(
        service.defineRole({
          relationsRoles: mockRoles,
          mentorRegistryCourses: null,
          studentCourses: null,
          userSession: mockUserSession,
          userGithubId: 'andrey',
        }),
      ).toBe('mentor');
    });

    it('should return "mentor" if user is an interviewer', () => {
      expect(
        service.defineRole({
          relationsRoles: mockRoles,
          mentorRegistryCourses: null,
          studentCourses: null,
          userSession: mockUserSession,
          userGithubId: 'max',
        }),
      ).toBe('mentor');
    });

    it('should return "mentor" if user is a stage-interviewer', () => {
      expect(
        service.defineRole({
          relationsRoles: mockRoles,
          mentorRegistryCourses: null,
          studentCourses: null,
          userSession: mockUserSession,
          userGithubId: 'alex',
        }),
      ).toBe('mentor');
    });

    it('should return "mentor" if user is assigned for checking a task', () => {
      expect(
        service.defineRole({
          relationsRoles: mockRoles,
          mentorRegistryCourses: null,
          studentCourses: null,
          userSession: mockUserSession,
          userGithubId: 'masha',
        }),
      ).toBe('mentor');
    });

    it('should return "coursementor" if user is a mentor of the is a student\'s course', () => {
      expect(
        service.defineRole({
          relationsRoles: null,
          mentorRegistryCourses: null,
          studentCourses: [{ courseId: 1 }, { courseId: 11 }],
          userSession: mockUserSession,
          userGithubId: 'denis',
        }),
      ).toBe('coursementor');
    });

    it('should return "coursemanager" if user is coursemanager of the course where mentor is waiting for confirmation', () => {
      expect(
        service.defineRole({
          relationsRoles: null,
          mentorRegistryCourses: [{ courseId: 1 }],
          studentCourses: null,
          userSession: { ...mockUserSession, courses: { 1: { roles: [CourseRole.Manager] } } },
          userGithubId: 'denis',
        }),
      ).toBe('coursemanager');
    });

    it('should return "all" if user is not a mentor at the course where requested user is a student', () => {
      expect(
        service.defineRole({
          relationsRoles: null,
          mentorRegistryCourses: null,
          studentCourses: [{ courseId: 1 }],
          userSession: { ...mockUserSession, courses: { 1: { roles: [] } } },
          userGithubId: 'denis',
        }),
      ).toBe('all');
    });

    it('should return "all" if user is not registered to any of courses', () => {
      expect(
        service.defineRole({
          relationsRoles: null,
          mentorRegistryCourses: null,
          studentCourses: null,
          userSession: mockUserSession,
          userGithubId: 'denis',
        }),
      ).toBe('all');
    });
  });

  describe('getProfilePermissionsSettings', () => {
    it('should not mutate provided permissions', () => {
      const permissions = {
        isProfileVisible: { all: true },
      };

      const permissionsSettings = service.getProfilePermissionsSettings(permissions);

      expect(permissions).toEqual({ isProfileVisible: { all: true } });
      expect(permissionsSettings).not.toEqual({ isProfileVisible: { all: true } });
    });
  });

  it('should return default permissions settings for the permission value that are not provided', () => {
    const permissions = {
      isProfileVisible: { all: false },
      isAboutVisible: { all: true, mentor: true, student: true },
      isEducationVisible: { all: true, mentor: true, student: true },
    };
    const permissionsSettings = service.getProfilePermissionsSettings(permissions);

    expect(permissionsSettings).toEqual({
      isProfileVisible: { all: false },
      isAboutVisible: { all: true, mentor: true, student: true },
      isEducationVisible: { all: true, mentor: true, student: true },
      isEnglishVisible: { all: false, student: false },
      isEmailVisible: { all: false, student: true },
      isTelegramVisible: { all: false, student: true },
      isSkypeVisible: { all: false, student: true },
      isPhoneVisible: { all: false, student: true },
      isContactsNotesVisible: { all: false, student: true },
      isLinkedInVisible: { all: false, mentor: false, student: false },
      isPublicFeedbackVisible: { all: false, mentor: false, student: false },
      isMentorStatsVisible: { all: false, mentor: false, student: false },
      isStudentStatsVisible: { all: false, student: false },
    });
  });
});
