import { NOT_FOUND, OK, FORBIDDEN } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { IUserSession } from '../../models';
import { ProfileInfo } from '../../../../common/models/profile';
import { getMentorStats } from './mentor-stats';
import { getPublicFeedback } from './public-feedback';
import { getStageInterviewFeedback } from './stage-interview-feedback';
import { getStudentStats } from './student-stats';
import { getUserInfo } from './user-info';
import { getPermissions, getOwnerPermissions } from './permissions';

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

export const getProfileInfo = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId: userGithubId } = ctx.state!.user as IUserSession;
  // const { isAdmin, roles } = ctx.state!.user as IUserSession;
  const { githubId = userGithubId } = ctx.query as { githubId: string | undefined };
  // console.log('GITHUB =>', githubId);
  // console.log('ADMIN =>', isAdmin);
  // console.log('ROLES =>', roles);

  if (!githubId) {
    return setResponse(ctx, NOT_FOUND);
  }

  const isProfileOwner = githubId === userGithubId;
  console.log('isProfileOwner', isProfileOwner);
  // await getRepository(ProfilePermissions).save({ userId });

  const permissions = await getPermissions(userGithubId, githubId, { isProfileOwner });

  const { isProfileVisible, isPublicFeedbackVisible, isMentorStatsVisible, isStudentStatsVisible } = permissions;

  if (!isProfileVisible && !isProfileOwner) {
    return setResponse(ctx, FORBIDDEN);
  }

  if (isProfileOwner) {
    const ownerPermissions = await getOwnerPermissions(userGithubId);

    console.log('OWN =>', ownerPermissions);
  }

  const { generalInfo, contacts } = await getUserInfo(githubId, permissions);
  const publicFeedback = isPublicFeedbackVisible ? await getPublicFeedback(githubId) : undefined;
  const mentorStats = isMentorStatsVisible ? await getMentorStats(githubId) : undefined;
  const studentStats = isStudentStatsVisible ? await getStudentStats(githubId) : undefined;
  const stageInterviewFeedback = await getStageInterviewFeedback(githubId);

  const profileInfo: ProfileInfo = {
    generalInfo,
    contacts,
    mentorStats,
    publicFeedback,
    stageInterviewFeedback,
    studentStats,
  };

  console.log(JSON.stringify(permissions, null, 2));
  console.log(JSON.stringify(profileInfo, null, 2));

  setResponse(ctx, OK, profileInfo);
};
