import { NOT_FOUND, OK, FORBIDDEN, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { IUserSession } from '../../models';
import { getMentorStats } from './mentor-stats';
import { getPublicFeedback } from './public-feedback';
import { getStageInterviewFeedback } from './stage-interview-feedback';
import { getStudentStats } from './student-stats';
import { getUserInfo } from './user-info';
import {
  getRelationsRoles,
  getStudentCourses,
  getPermissions,
  getMentorCourses,
  defineRole,
  RelationRole,
  Permissions,
} from './permissions';

export const getProfileInfo = (_: ILogger) => async (ctx: Router.RouterContext) => {
  if (!ctx.state.user) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const session = ctx.state.user as IUserSession;
  const { githubId: userGithubId, isAdmin } = session;
  const { githubId: requestedGithubId = userGithubId } = ctx.query as { githubId: string | undefined };

  if (!requestedGithubId) {
    return setResponse(ctx, NOT_FOUND);
  }

  const isProfileOwner = requestedGithubId === userGithubId;

  let role: RelationRole;
  let permissions: Permissions;

  if (isProfileOwner) {
    role = 'all';
    permissions = getPermissions({ isProfileOwner, isAdmin });
  } else {
    const relationsRoles = await getRelationsRoles(userGithubId, requestedGithubId);
    const [studentCourses, registryCourses] = !relationsRoles
      ? await Promise.all([getStudentCourses(requestedGithubId), getMentorCourses(requestedGithubId)])
      : [null, null];
    role = defineRole({ relationsRoles, studentCourses, registryCourses, session, userGithubId });
    permissions = getPermissions({ isAdmin, isProfileOwner, role });
  }

  const { isProfileVisible, isMentorStatsVisible, isStudentStatsVisible, isStageInterviewFeedbackVisible } =
    permissions;

  if (!isProfileVisible && !isProfileOwner) {
    return setResponse(ctx, FORBIDDEN);
  }

  const isEpamEmailVisible = isAdmin || ['all', 'coursemanager'].includes(role);

  const { generalInfo, contacts, discord } = await getUserInfo(requestedGithubId, isEpamEmailVisible);
  const publicFeedback = await getPublicFeedback(requestedGithubId);
  const mentorStats = isMentorStatsVisible ? await getMentorStats(requestedGithubId) : undefined;
  const studentStats = isStudentStatsVisible ? await getStudentStats(requestedGithubId, permissions) : undefined;
  const stageInterviewFeedback = isStageInterviewFeedbackVisible
    ? await getStageInterviewFeedback(requestedGithubId)
    : undefined;

  const profileInfo = {
    generalInfo,
    contacts,
    discord,
    mentorStats,
    publicFeedback,
    stageInterviewFeedback,
    studentStats,
  };

  setResponse(ctx, OK, profileInfo);
};
