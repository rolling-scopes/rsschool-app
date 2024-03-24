import { get, mergeWith, cloneDeep, mapValues } from 'lodash';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigurableProfilePermissions, Permissions } from './dto/permissions.dto';
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
} from '@entities/index';
import { defaultProfilePermissionsSettings } from '@entities/profilePermissions';

type RelationRole = 'student' | 'mentor' | 'coursementor' | 'coursesupervisor' | 'coursemanager' | 'all';

export interface Relations {
  student: string;
  mentors: string[];
  interviewers: string[];
  stageInterviewers: string[];
  checkers: string[];
}

interface PermissionsSetup {
  isProfileOwner: boolean;
  isAdmin: boolean;
  role?: RelationRole;
  permissions?: ConfigurableProfilePermissions;
}

type Permission = keyof Permissions;

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

const accessToContactsDefaultPermissions: Permission[] = [
  'isEmailVisible',
  'isWhatsAppVisible',
  'isTelegramVisible',
  'isSkypeVisible',
  'isPhoneVisible',
  'isContactsNotesVisible',
];
const accessToContactsPermissions: Permission[] = [
  'isEmailVisible',
  'isTelegramVisible',
  'isSkypeVisible',
  'isPhoneVisible',
  'isWhatsAppVisible',
  'isContactsNotesVisible',
  'isEnglishVisible',
];
const accessToFeedbacksPermissions: Permission[] = [
  'isStageInterviewFeedbackVisible',
  'isStudentStatsVisible',
  'isCoreJsFeedbackVisible',
  'isProfileVisible',
  'isExpellingReasonVisible',
];
const accessToProfilePermissions: Permission[] = ['isProfileVisible'];
const accessToOwnFeedbackPermissions: Permission[] = [
  'isStageInterviewFeedbackVisible',
  'isCoreJsFeedbackVisible',
  'isExpellingReasonVisible',
];

const accessToContactsDefaultRoles: RelationRole[] = ['student'];
const accessToContactsRoles: RelationRole[] = ['mentor', 'coursemanager', 'coursesupervisor'];
const accessToFeedbacksRoles: RelationRole[] = ['mentor', 'coursementor', 'coursemanager'];
const accessToProfileRoles: RelationRole[] = ['student'];

const getRolePermissionsChecker = (permissions: Permission[], roles: RelationRole[]) => {
  return (permission: Permission, role?: RelationRole) => {
    return !!role && roles.includes(role) && permissions.includes(permission);
  };
};

const isProfileAccessible = getRolePermissionsChecker(accessToProfilePermissions, accessToProfileRoles);
const areFeedbacksAccessible = getRolePermissionsChecker(accessToFeedbacksPermissions, accessToFeedbacksRoles);
const areContactsAccessible = getRolePermissionsChecker(accessToContactsPermissions, accessToContactsRoles);
const areContactsAccessibleByDefault = getRolePermissionsChecker(
  accessToContactsDefaultPermissions,
  accessToContactsDefaultRoles,
);

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(ProfilePermissions)
    private profilePermissionsRepository: Repository<ProfilePermissions>,
  ) {}

  getAccessRights({ isAdmin, isProfileOwner, role, permissions }: PermissionsSetup): Permissions {
    return mapValues(defaultPermissions, (_, permission: Permission) => {
      if (isAdmin || role === 'coursemanager') {
        return true;
      }
      if (role === 'coursesupervisor' && permission === 'isProfileVisible') {
        return true;
      }
      if (areFeedbacksAccessible(permission, role)) {
        return true;
      }
      if (areContactsAccessible(permission, role)) {
        return true;
      }
      if (isProfileAccessible(permission, role)) {
        return true;
      }
      // do not show own feedbacks
      if (isProfileOwner && !accessToOwnFeedbackPermissions.includes(permission)) {
        return true;
      }
      if (get(permissions, `${permission}.all`) || get(permissions, `${permission}.${role}`)) {
        return true;
      }
      // show mentor contacts to students by default
      if (get(permissions, `${permission}.student`) === undefined && areContactsAccessibleByDefault(permission, role)) {
        return true;
      }
      return false;
    });
  }

  getProfilePermissionsSettings(permissions: ConfigurableProfilePermissions) {
    const newPermissions = cloneDeep(permissions);

    mergeWith(newPermissions, defaultProfilePermissionsSettings, (setting, defaultSetting) =>
      mapValues(defaultSetting, (value, key) => get(setting, key, value)),
    );

    return newPermissions;
  }

  async getProfilePermissions(githubId: string): Promise<ConfigurableProfilePermissions> {
    const permissions = await this.profilePermissionsRepository
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
      .getRawOne();

    return permissions ?? {};
  }

  defineRole({
    relationsRoles,
    studentCourses,
    mentorRegistryCourses,
    userSession,
    userGithubId,
  }: {
    relationsRoles: Relations | null;
    mentorRegistryCourses: { courseId: number }[] | null;
    studentCourses: { courseId: number }[] | null;
    userSession: IUserSession;
    userGithubId: string;
  }): RelationRole {
    if (mentorRegistryCourses?.some(({ courseId }) => isManager(userSession, courseId))) {
      return 'coursemanager';
    } else if (mentorRegistryCourses?.some(({ courseId }) => isSupervisor(userSession, courseId))) {
      return 'coursesupervisor';
    } else if (studentCourses?.some(({ courseId }) => isManager(userSession, courseId))) {
      return 'coursemanager';
    } else if (studentCourses?.some(({ courseId }) => isSupervisor(userSession, courseId))) {
      return 'coursemanager';
    } else if (relationsRoles) {
      const { student, mentors, interviewers, stageInterviewers, checkers } = relationsRoles;

      if (student === userGithubId) {
        return 'student';
      } else if (new Set([...mentors, ...interviewers, ...stageInterviewers, ...checkers]).has(userGithubId)) {
        return 'mentor';
      }
    } else if (studentCourses?.some(({ courseId }) => !!userSession?.courses?.[courseId]?.mentorId)) {
      return 'coursementor';
    }

    return 'all';
  }

  async getRelationsRoles(userGithubId: string, requestedGithubId: string): Promise<Relations | null> {
    return (
      (await this.studentRepository
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
        .getRawOne()) || null
    );
  }
}
