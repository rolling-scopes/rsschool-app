import { NOT_FOUND, OK, FORBIDDEN } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { IUserSession } from '../../models';
import { ProfileInfo, ConfigurableProfilePermissions } from '../../../../common/models/profile';
import { getMentorStats } from './mentor-stats';
import { getPublicFeedback } from './public-feedback';
import { getStageInterviewFeedback } from './stage-interview-feedback';
import { getStudentStats } from './student-stats';
import { getUserInfo } from './user-info';
import {
  getProfilePermissionsSettings,
  getConfigurableProfilePermissions,
  getRelationsRoles,
  getStudentCourses,
  getPermissions,
  getMentorRegistryCourses,
  defineRole,
  RelationRole,
  Permissions,
} from './permissions';

export const getProfileInfo = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const session = ctx.state!.user as IUserSession;
  const { githubId: userGithubId, isAdmin } = ctx.state!.user as IUserSession;
  const { githubId: requestedGithubId = userGithubId } = ctx.query as { githubId: string | undefined };

  if (!requestedGithubId) {
    return setResponse(ctx, NOT_FOUND);
  }

  const isProfileOwner = requestedGithubId === userGithubId;

  const profilePermissions = await getConfigurableProfilePermissions(requestedGithubId);

  let role: RelationRole;
  let permissions: Permissions;
  let permissionsSettings: ConfigurableProfilePermissions | undefined;
  if (isProfileOwner) {
    role = 'all';
    permissions = getPermissions({ isProfileOwner, isAdmin });
    permissionsSettings = getProfilePermissionsSettings(profilePermissions);
  } else {
    const relationsRoles = await getRelationsRoles(userGithubId, requestedGithubId);
    const [studentCourses, registryCourses] = !relationsRoles
      ? await Promise.all([getStudentCourses(requestedGithubId), getMentorRegistryCourses(requestedGithubId)])
      : [null, null];
    role = defineRole({ relationsRoles, studentCourses, registryCourses, session, userGithubId });
    permissions = getPermissions({ isAdmin, isProfileOwner, role, permissions: profilePermissions });
  }

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

  const { generalInfo, contacts, discord } = await getUserInfo(requestedGithubId, permissions);
  const publicFeedback = isPublicFeedbackVisible ? await getPublicFeedback(requestedGithubId) : undefined;
  const mentorStats = isMentorStatsVisible ? await getMentorStats(requestedGithubId) : undefined;
  const studentStats = isStudentStatsVisible ? await getStudentStats(requestedGithubId, permissions) : undefined;
  const stageInterviewFeedback = isStageInterviewFeedbackVisible
    ? await getStageInterviewFeedback(requestedGithubId)
    : undefined;

  const profileInfo: ProfileInfo = {
    permissionsSettings,
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
