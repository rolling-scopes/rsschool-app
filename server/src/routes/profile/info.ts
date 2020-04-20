import { NOT_FOUND, OK, FORBIDDEN } from 'http-status-codes';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
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
  defineRole,
  RelationRole,
  Permissions,
} from './permissions';
import { ConsentRepository } from '../../repositories/consent';

export const getProfileInfo = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId: userGithubId, roles, coursesRoles, isAdmin } = ctx.state!.user as IUserSession;
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
    const studentCourses = !relationsRoles ? await getStudentCourses(requestedGithubId) : null;
    role = defineRole({ relationsRoles, studentCourses, roles, coursesRoles, userGithubId });
    permissions = getPermissions({ isAdmin, isProfileOwner, role, permissions: profilePermissions });
  }

  const {
    isProfileVisible,
    isPublicFeedbackVisible,
    isMentorStatsVisible,
    isStudentStatsVisible,
    isStageInterviewFeedbackVisible,
    isConsentsVisible,
  } = permissions;

  if (!isProfileVisible && !isProfileOwner) {
    return setResponse(ctx, FORBIDDEN);
  }

  const { generalInfo, contacts } = await getUserInfo(requestedGithubId, permissions);
  const publicFeedback = isPublicFeedbackVisible ? await getPublicFeedback(requestedGithubId) : undefined;
  const mentorStats = isMentorStatsVisible ? await getMentorStats(requestedGithubId) : undefined;
  const studentStats = isStudentStatsVisible ? await getStudentStats(requestedGithubId, permissions) : undefined;
  const stageInterviewFeedback = isStageInterviewFeedbackVisible
    ? await getStageInterviewFeedback(requestedGithubId)
    : undefined;
  const consents = isConsentsVisible
    ? await getCustomRepository(ConsentRepository).findByGithubIds([requestedGithubId])
    : undefined;

  const profileInfo: ProfileInfo = {
    permissionsSettings,
    generalInfo,
    contacts,
    consents,
    mentorStats,
    publicFeedback,
    stageInterviewFeedback,
    studentStats,
  };

  setResponse(ctx, OK, profileInfo);
};
