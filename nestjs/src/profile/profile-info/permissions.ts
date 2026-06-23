import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';
import { IUserSession, isManager, isSupervisor } from '@entities/session';
import { defaultProfilePermissionsSettings } from '@entities/profilePermissions';
import { ConfigurableProfilePermissions } from '@common/models/profile';

export interface Relations {
  student: string;
  mentors: string[];
  interviewers: string[];
  stageInterviewers: string[];
  checkers: string[];
}

export type RelationRole = 'student' | 'mentor' | 'coursementor' | 'coursesupervisor' | 'coursemanager' | 'all';

interface PermissionsSetup {
  isProfileOwner: boolean;
  isAdmin: boolean;
  role?: RelationRole;
  permissions?: ConfigurableProfilePermissions;
}

export interface Permissions {
  isProfileVisible: boolean;
  isAboutVisible: boolean;
  isEducationVisible: boolean;
  isEnglishVisible: boolean;
  isEmailVisible: boolean;
  isTelegramVisible: boolean;
  isSkypeVisible: boolean;
  isWhatsAppVisible: boolean;
  isPhoneVisible: boolean;
  isContactsNotesVisible: boolean;
  isLinkedInVisible: boolean;
  isPublicFeedbackVisible: boolean;
  isMentorStatsVisible: boolean;
  isStudentStatsVisible: boolean;
  isStageInterviewFeedbackVisible: boolean;
  isCoreJsFeedbackVisible: boolean;
  isConsentsVisible: boolean;
  isExpellingReasonVisible: boolean;
}

export const defineRole = ({
  relationsRoles,
  studentCourses,
  registryCourses,
  session,
  userGithubId,
}: {
  relationsRoles: Relations | null;
  registryCourses: { courseId: number }[] | null;
  studentCourses: { courseId: number }[] | null;
  session: IUserSession;
  userGithubId: string;
}): RelationRole => {
  if (registryCourses?.some(({ courseId }) => isManager(session, courseId))) {
    return 'coursemanager';
  } else if (registryCourses?.some(({ courseId }) => isSupervisor(session, courseId))) {
    return 'coursesupervisor';
  } else if (studentCourses?.some(({ courseId }) => isManager(session, courseId))) {
    return 'coursemanager';
  } else if (studentCourses?.some(({ courseId }) => isSupervisor(session, courseId))) {
    return 'coursemanager';
  } else if (relationsRoles) {
    const { student, mentors, interviewers, stageInterviewers, checkers } = relationsRoles;

    if (student === userGithubId) {
      return 'student';
    } else if (new Set([...mentors, ...interviewers, ...stageInterviewers, ...checkers]).has(userGithubId)) {
      return 'mentor';
    }
  } else if (studentCourses?.some(({ courseId }) => !!session?.courses?.[courseId]?.mentorId)) {
    return 'coursementor';
  }

  return 'all';
};

export const getPermissions = ({ isAdmin, isProfileOwner, role, permissions }: PermissionsSetup): Permissions => {
  const defaultPermissions: Permissions = {
    isProfileVisible: false,
    isAboutVisible: false,
    isEducationVisible: false,
    isEnglishVisible: false,
    isEmailVisible: false,
    isTelegramVisible: false,
    isSkypeVisible: false,
    isWhatsAppVisible: false,
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
  };

  const accessToContacts = (permission: string, role?: RelationRole) => {
    return (
      [
        'isEmailVisible',
        'isTelegramVisible',
        'isSkypeVisible',
        'isPhoneVisible',
        'isWhatsAppVisible',
        'isContactsNodesVisible',
        'isEnglishVisible',
      ].includes(permission) &&
      role &&
      ['mentor', 'coursemanager', 'coursesupervisor'].includes(role)
    );
  };

  const defaultAccessToContacts = (permission: string, role?: RelationRole) => {
    return (
      [
        'isEmailVisible',
        'isWhatsAppVisible',
        'isTelegramVisible',
        'isSkypeVisible',
        'isPhoneVisible',
        'isContactsNodesVisible',
      ].includes(permission) &&
      role &&
      ['student'].includes(role)
    );
  };

  const accessToFeedbacks = (permission: string, role?: RelationRole) => {
    return (
      [
        'isStageInterviewFeedbackVisible',
        'isStudentStatsVisible',
        'isCoreJsFeedbackVisible',
        'isProfileVisible',
        'isExpellingReasonVisible',
      ].includes(permission) &&
      role &&
      ['mentor', 'coursementor', 'coursemanager'].includes(role)
    );
  };

  const accessToProfile = (permission: string, role?: RelationRole) =>
    ['isProfileVisible'].includes(permission) && role && ['student'].includes(role);

  return mapValues(defaultPermissions, (_, permission) => {
    if (isAdmin || role === 'coursemanager') {
      return true;
    }
    if (role === 'coursesupervisor' && permission === 'isProfileVisible') {
      return true;
    }
    if (accessToFeedbacks(permission, role)) {
      return true;
    }
    if (accessToContacts(permission, role)) {
      return true;
    }
    if (accessToProfile(permission, role)) {
      return true;
    }
    // do not show own feedbacks
    if (
      isProfileOwner &&
      !['isStageInterviewFeedbackVisible', 'isCoreJsFeedbackVisible', 'isExpellingReasonVisible'].includes(permission)
    ) {
      return true;
    }
    if (get(permissions, `${permission}.all`) || get(permissions, `${permission}.${role}`)) {
      return true;
    }
    // show mentor contacts to students by default
    if (get(permissions, `${permission}.student`) === undefined && defaultAccessToContacts(permission, role)) {
      return true;
    }
    return false;
  });
};

export const getProfilePermissionsSettings = (permissions: ConfigurableProfilePermissions) => {
  const newPermissions = cloneDeep(permissions);

  mergeWith(newPermissions, defaultProfilePermissionsSettings, (setting, defaultSetting) =>
    mapValues(defaultSetting, (value, key) => get(setting, key, value)),
  );

  return newPermissions;
};

export const getFullName = (firstName: string, lastName: string, githubId: string) =>
  [firstName, lastName].filter(Boolean).join(' ') || githubId;
