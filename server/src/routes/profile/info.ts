import { NOT_FOUND, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import {
  User,
  ProfilePermissions,
  IUserSession,
} from '../../models';
import { ProfileInfo } from '../../../../common/models/profile';
import { getMentorStats } from './mentor-stats';
import { getPublicFeedback } from './public-feedback';
import { getStageInterviewFeedback } from './stage-interview-feedback';
import { getStudentStats } from './student-stats';
import { getUserInfo } from './user-info';

/*
  WHO CAN SEE
    Admins               | Assigned mentor | Mentors | Assigned student | All
    ***
                                1. General info [+]
    Name                 | Yes             | Yes     | Yes              | Yes
    Github               | Yes             | Yes     | *                | *
    Location (main)      | Yes             | Yes     | *                | *

    Education            | *               | *       | *                | *

    English              | Yes             | Yes     | *                | *

                                2. Contacts [+]
    EPAM email           | No              | No      | No               | No
    Primary email        | *               | *       | *                | *
    Telegram             | *               | *       | *                | *
    Skype                | *               | *       | *                | *
    Phone                | *               | *       | *                | *
    Contact notes        | *               | *       | *                | *
    LinkedIn profile     | *               | *       | *                | *

                                3. Public feedback (Gratitude) [+]
    *

                                4. Statistics
    Count of mentored    | Yes             | Yes     | Yes              | *
    students
    Number of courses    | Yes             | Yes     | Yes              | *
    as a mentor

                                5. Course statistics
    Course when was      | Yes             | Yes     | Yes              | *
    a mentor/student
    List of students     | No              | No      | No               | No
    for mentor for
    each course
    List of tasks/scores | Yes             | Yes     | No               | *
    for student for
    each course

    Stage interview      | Yes             | Yes     | No               | *
    Feedback
    (Pre-Screening)
    Core JS Interview    | Yes             | Yes     | No               | *
    Feedback
*/

const getProfilePermissions = async (githubId: string): Promise<any> => (
  await getRepository(ProfilePermissions)
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
    .getRawOne()
);

const getRelationRole = async (githubId: string): Promise<any> => (
  await getRepository(User)
    .createQueryBuilder('pp')
    .select('"pp"."isProfileVisible" AS "isProfileVisible"')
    .addSelect('"pp"."isAboutVisible" AS "isAboutVisible"')
    .leftJoin(User, 'user', '"user"."id" = "pp"."userId"')
    .where('"user"."githubId" = :githubId', { githubId })
    .getRawOne()
);

export const getProfileInfo = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const {
    // id: userId,
    githubId: userGithubId,
  } = ctx.state!.user as IUserSession;
  // const { isAdmin, roles } = ctx.state!.user as IUserSession;
  const { githubId } = ctx.query as { githubId: string | undefined };

  // console.log('GITHUB =>', githubId);
  // console.log('ADMIN =>', isAdmin);
  // console.log('ROLES =>', roles);

  if (!githubId) {
    return setResponse(ctx, NOT_FOUND);
  }

  // await getRepository(ProfilePermissions).save({ userId });

  const permissions = await getProfilePermissions(githubId);
  const role = await getRelationRole(githubId, userGithubId);

  console.log(JSON.stringify(permissions, null, 2));

  const { generalInfo, contacts } = await getUserInfo(githubId);
  const publicFeedback = await getPublicFeedback(githubId);
  const mentorStats = await getMentorStats(githubId);
  const studentStats = await getStudentStats(githubId);
  const stageInterviewFeedback = await getStageInterviewFeedback(githubId);

  const profileInfo: ProfileInfo = {
    generalInfo,
    contacts,
    mentorStats,
    publicFeedback,
    stageInterviewFeedback,
    studentStats,
  };

  // console.log(JSON.stringify(profileInfo, null, 2));

  setResponse(ctx, OK, profileInfo);
};
