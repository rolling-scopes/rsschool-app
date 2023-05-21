import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';
import { In, getRepository } from 'typeorm';
import {
  User,
  Student,
  Mentor,
  ProfilePermissions,
  TaskChecker,
  TaskInterviewResult,
  StageInterview,
  isManager,
  IUserSession,
  isSupervisor,
  MentorRegistry,
  Discipline,
  Course,
} from '../../models';
import { defaultProfilePermissionsSettings } from '../../models/profilePermissions';
import { ConfigurableProfilePermissions } from '../../../../common/models/profile';

interface Relations {
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

export const getStudentCourses = async (githubId: string): Promise<{ courseId: number }[] | null> => {
  const result = await getRepository(User)
    .createQueryBuilder('user')
    .select('"student"."courseId" AS "courseId"')
    .leftJoin(Student, 'student', '"student"."userId" = "user"."id"')
    .where('"user"."githubId" = :githubId', { githubId })
    .getRawMany();
  return result ?? null;
};

export const getMentorCourses = async (githubId: string): Promise<{ courseId: number }[] | null> => {
  const [registerdCourseIds, registryCourseIds] = await Promise.all([
    getRegisteredMentorsCourseIds(githubId),
    getMentorsFromRegistryCourseIds(githubId),
  ]);

  const mentorsCourses = registerdCourseIds.concat(registryCourseIds);

  return mentorsCourses.length ? mentorsCourses : null;
};

const getRegisteredMentorsCourseIds = async (githubId: string) => {
  const result: { courseId: number }[] = await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .select(['mentor.courseId'])
    .leftJoin('mentor.user', 'user')
    .where('user.githubId = :githubId', { githubId })
    .getMany();

  return result.length ? result : [];
};

const getMentorsFromRegistryCourseIds = async (githubId: string) => {
  const result = await getRepository(MentorRegistry)
    .createQueryBuilder('mentorRegistry')
    .select(['mentorRegistry.preferedCourses', 'mentorRegistry.technicalMentoring'])
    .leftJoin('mentorRegistry.user', 'user')
    .where('user.githubId = :githubId', { githubId })
    .andWhere('"mentorRegistry".canceled = false')
    .getOne();

  const disciplines = await getRepository(Discipline).find({ where: { name: In(result?.technicalMentoring ?? []) } });
  const disciplinesIds = disciplines.map(({ id }) => id);
  const coursesByDisciplines = await getRepository(Course).find({ where: { disciplineId: In(disciplinesIds) } });

  const preferredCourseIds = result?.preferedCourses?.map(courseId => ({ courseId: Number(courseId) })) ?? [];
  const courseIdsByDisciplines = coursesByDisciplines.map(({ id }) => ({ courseId: id }));

  const courseIds = uniqBy(preferredCourseIds.concat(courseIdsByDisciplines), ({ courseId }) => courseId);

  return courseIds;
};

export const getConfigurableProfilePermissions = async (githubId: string): Promise<ConfigurableProfilePermissions> =>
  (await getRepository(ProfilePermissions)
    .createQueryBuilder('pp')
    .select('"pp"."isProfileVisible" AS "isProfileVisible"')
    .addSelect('"pp"."isAboutVisible" AS "isAboutVisible"')
    .addSelect('"pp"."isEducationVisible" AS "isEducationVisible"')
    .addSelect('"pp"."isEnglishVisible" AS "isEnglishVisible"')
    .addSelect('"pp"."isEmailVisible" AS "isEmailVisible"')
    .addSelect('"pp"."isTelegramVisible" AS "isTelegramVisible"')
    .addSelect('"pp"."isSkypeVisible" AS "isSkypeVisible"')
    .addSelect('"pp"."isPhoneVisible" AS "isPhoneVisible"')
    .addSelect('"pp"."isContactsNotesVisible" AS "isContactsNotesVisible"')
    .addSelect('"pp"."isLinkedInVisible" AS "isLinkedInVisible"')
    .addSelect('"pp"."isPublicFeedbackVisible" AS "isPublicFeedbackVisible"')
    .addSelect('"pp"."isMentorStatsVisible" AS "isMentorStatsVisible"')
    .addSelect('"pp"."isStudentStatsVisible" AS "isStudentStatsVisible"')
    .leftJoin(User, 'user', '"user"."id" = "pp"."userId"')
    .where('"user"."githubId" = :githubId', { githubId })
    .getRawOne()) || {};

export const getRelationsRoles = async (userGithubId: string, requestedGithubId: string): Promise<Relations | null> =>
  (await getRepository(Student)
    .createQueryBuilder('student')
    .select('"userStudent"."githubId" AS "student"')
    .addSelect('ARRAY_AGG("userMentor"."githubId") as "mentors"')
    .addSelect('ARRAY_AGG("userInterviewer"."githubId") as "interviewers"')
    .addSelect('ARRAY_AGG("userStageInterviewer"."githubId") as "stageInterviewers"')
    .addSelect('ARRAY_AGG("userChecker"."githubId") as "checkers"')
    .leftJoin(User, 'userStudent', '"student"."userId" = "userStudent"."id"')
    .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
    .leftJoin(User, 'userMentor', '"mentor"."userId" = "userMentor"."id"')
    .leftJoin(TaskChecker, 'taskChecker', '"student"."id" = "taskChecker"."studentId"')
    .leftJoin(Mentor, 'mentorChecker', '"mentorChecker"."id" = "taskChecker"."mentorId"')
    .leftJoin(User, 'userChecker', '"mentorChecker"."userId" = "userChecker"."id"')
    .leftJoin(TaskInterviewResult, 'taskInterviewResult', '"student"."id" = "taskInterviewResult"."studentId"')
    .leftJoin(Mentor, 'mentorInterviewer', '"mentorInterviewer"."id" = "taskInterviewResult"."mentorId"')
    .leftJoin(User, 'userInterviewer', '"mentorInterviewer"."userId" = "userInterviewer"."id"')
    .leftJoin(StageInterview, 'stageInterview', '"student"."id" = "stageInterview"."studentId"')
    .leftJoin(Mentor, 'mentorStageInterviewer', '"mentorStageInterviewer"."id" = "stageInterview"."mentorId"')
    .leftJoin(User, 'userStageInterviewer', '"mentorStageInterviewer"."userId" = "userStageInterviewer"."id"')
    .where(
      `"userStudent"."githubId" = :userGithubId AND
      ("userMentor"."githubId" = :requestedGithubId OR
      "userStageInterviewer"."githubId" = :requestedGithubId OR
      "userInterviewer"."githubId" = :requestedGithubId OR
      "userChecker"."githubId" = :requestedGithubId )`,
      { userGithubId, requestedGithubId },
    )
    .orWhere(
      `"userStudent"."githubId" = :requestedGithubId AND
      ("userMentor"."githubId" = :userGithubId OR
      "userStageInterviewer"."githubId" = :userGithubId OR
      "userInterviewer"."githubId" = :userGithubId OR
      "userChecker"."githubId" = :userGithubId)`,
    )
    .groupBy('"userStudent"."githubId"')
    .getRawOne()) || null;

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
