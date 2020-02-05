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
import {
  getOwnerPermissions,
  getConfigurableProfilePermissions,
  getRelationsRoles,
  getStudentCourses,
  getPermissions,
  mergeRoles,
  RelationRole,
  Permissions,
} from './permissions';

export const getProfileInfo = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId: userGithubId, roles } = ctx.state!.user as IUserSession;
  const { githubId: requestedGithubId = userGithubId } = ctx.query as { githubId: string | undefined };

  if (!requestedGithubId) {
    return setResponse(ctx, NOT_FOUND);
  }

  const isProfileOwner = requestedGithubId === userGithubId;

  let role: RelationRole;
  let permissions: Permissions;
  if (isProfileOwner) {
    role = 'all';
    permissions = getPermissions({ isProfileOwner });
  } else {
    const profilePermissions = await getConfigurableProfilePermissions(requestedGithubId);
    const relationsRoles = await getRelationsRoles(userGithubId, requestedGithubId);
    const studentCourses = !relationsRoles ? await getStudentCourses(requestedGithubId) : null;
    role = mergeRoles({ relationsRoles, studentCourses, roles, userGithubId });
    permissions = getPermissions({ isProfileOwner, role, permissions: profilePermissions });
  }

  console.log(JSON.stringify(permissions, null, 2));
  console.log(JSON.stringify(role, null, 2));

  const {
    isProfileVisible,
    isPublicFeedbackVisible,
    isMentorStatsVisible,
    isStudentStatsVisible,
    isStageInterviewFeedbackVisible,
  } = permissions;

  if (!isProfileVisible && !isProfileOwner) {
    return setResponse(ctx, FORBIDDEN);
  }

  const permissionsSettings = isProfileOwner ? await getOwnerPermissions(userGithubId) : undefined;

  const { generalInfo, contacts } = await getUserInfo(requestedGithubId, permissions);
  const publicFeedback = isPublicFeedbackVisible ? await getPublicFeedback(requestedGithubId) : undefined;
  const mentorStats = isMentorStatsVisible ? await getMentorStats(requestedGithubId) : undefined;
  const studentStats = isStudentStatsVisible ? await getStudentStats(requestedGithubId, permissions) : undefined;
  const stageInterviewFeedback = isStageInterviewFeedbackVisible ?
    await getStageInterviewFeedback(requestedGithubId) :
    undefined;

  const profileInfo: ProfileInfo = {
    permissionsSettings,
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
