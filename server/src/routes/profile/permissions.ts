import { get, mapValues } from 'lodash';
import { getRepository } from 'typeorm';
import {
  User,
  Student,
  Mentor,
  ProfilePermissions,
  TaskChecker,
  TaskInterviewResult,
  StageInterview,
} from '../../models';
import {
  PublicVisibilitySettings,
  VisibilitySettings,
  defaultPublicVisibilitySettings,
  defaultVisibilitySettings,
} from '../../models/profilePermissions';

interface Relations {
  student: string;
  mentors: string[] ;
  interviewers: string[];
  stageInterviewers: string[];
  checkers: string[];
}

type RelationRole = 'student' | 'mentor' | 'all';

interface SuperAccessRights {
  isProfileOwner: boolean;
}

interface ConfigurableProfilePermissions {
  isProfileVisible: PublicVisibilitySettings;
  isAboutVisible: VisibilitySettings;
  isEducationVisible: VisibilitySettings;
  isEnglishVisible: VisibilitySettings;
  isEmailVisible: VisibilitySettings;
  isTelegramVisible: VisibilitySettings;
  isSkypeVisible: VisibilitySettings;
  isPhoneVisible: VisibilitySettings;
  isContactsNotesVisible: VisibilitySettings;
  isLinkedInVisible: VisibilitySettings;
  isPublicFeedbackVisible: VisibilitySettings;
  isMentorStatsVisible: VisibilitySettings;
  isStudentStatsVisible: VisibilitySettings;
}

export interface Permissions {
  isProfileVisible: boolean;
  isAboutVisible: boolean;
  isEducationVisible: boolean;
  isEnglishVisible: boolean;
  isEmailVisible: boolean;
  isTelegramVisible: boolean;
  isSkypeVisible: boolean;
  isPhoneVisible: boolean;
  isContactsNotesVisible: boolean;
  isLinkedInVisible: boolean;
  isPublicFeedbackVisible: boolean;
  isMentorStatsVisible: boolean;
  isStudentStatsVisible: boolean;
}

const getConfigurableProfilePermissions = async (githubId: string): Promise<ConfigurableProfilePermissions> => (
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
    .getRawOne()) || {}
);

const getRelationRole = async (userGithubId: string, requestedGithubId: string): Promise<RelationRole> => {
  const relations: Relations | undefined = await getRepository(Student)
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
    .where(`"userStudent"."githubId" = :userGithubId AND
      ("userMentor"."githubId" = :requestedGithubId OR
      "userStageInterviewer"."githubId" = :requestedGithubId OR
      "userInterviewer"."githubId" = :requestedGithubId OR
      "userChecker"."githubId" = :requestedGithubId )`, { userGithubId, requestedGithubId })
    .orWhere(`"userStudent"."githubId" = :requestedGithubId AND
      ("userMentor"."githubId" = :userGithubId OR
      "userStageInterviewer"."githubId" = :userGithubId OR
      "userInterviewer"."githubId" = :userGithubId OR
      "userChecker"."githubId" = :userGithubId)`)
    .groupBy('"userStudent"."githubId"')
    .getRawOne();

  if (relations) {
    const { student, mentors, interviewers, stageInterviewers, checkers } = relations;

    if (student === userGithubId) {
      return 'student';
    } else if (new Set([...mentors, ...interviewers, ...stageInterviewers, ...checkers]).has(userGithubId)) {
      return 'mentor';
    }
  }
  return 'all';
};

const matchPermissions = (
  permissions: ConfigurableProfilePermissions,
  role: RelationRole,
  { isProfileOwner }: SuperAccessRights,
): Permissions => {
  const p: Permissions = {
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
  };

  // (Object.keys(p) as (keyof Permissions)[]).forEach((key) => {
  //   p[key] = isProfileOwner || permissions[key].all || permissions[key][role];
  // });

  // return p;

  return mapValues(p, (_, key) => isProfileOwner ||
    get(permissions, `${key}.all`) ||
    get(permissions, `${key}.${role}`) ||
    false,
  );
};

export const getPermissions = async (
  userGithubId: string,
  requestedGithubId: string,
  superAccessRights: SuperAccessRights,
) => {
  const permissions = await getConfigurableProfilePermissions(requestedGithubId);
  const role = await getRelationRole(userGithubId, requestedGithubId);
  return matchPermissions(permissions, role, superAccessRights);
};

export const getOwnerPermissions = async (githubId: string) => {
  const permissions = await getConfigurableProfilePermissions(githubId);
  const p: ConfigurableProfilePermissions = {
    isProfileVisible: defaultPublicVisibilitySettings,
    isAboutVisible: defaultVisibilitySettings,
    isEducationVisible: defaultVisibilitySettings,
    isEnglishVisible: defaultVisibilitySettings,
    isEmailVisible: defaultVisibilitySettings,
    isTelegramVisible: defaultVisibilitySettings,
    isSkypeVisible: defaultVisibilitySettings,
    isPhoneVisible: defaultVisibilitySettings,
    isContactsNotesVisible: defaultVisibilitySettings,
    isLinkedInVisible: defaultVisibilitySettings,
    isPublicFeedbackVisible: defaultVisibilitySettings,
    isMentorStatsVisible: defaultVisibilitySettings,
    isStudentStatsVisible: defaultVisibilitySettings,
  };

  return mapValues(p, (value, key) => get(permissions, key, value));
};
