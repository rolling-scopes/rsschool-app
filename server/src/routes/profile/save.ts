import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { ProfilePermissions } from '../../models';
import { ProfileInfo } from '../../../../common/models/profile';
import { IUserSession } from '../../models/session';
import { setResponse } from '../utils';

export const updateProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { id: userId } = ctx.state!.user as IUserSession;
  const profileInfo: Partial<ProfileInfo> = ctx.request.body;

  if (!profileInfo) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  console.log(userId, profileInfo);

  const profileRepository = await getRepository(ProfilePermissions);
  const userPermissions = (await profileRepository.findOne({ where: { userId } }));

  const result = await profileRepository.save({
    id: userPermissions ? userPermissions.id : undefined,
    userId,
    ...profileInfo.permissionsSettings,
  });

  console.log(result);
  // const user = await userRepository.findOne({ where: { githubId } });
  // if (!user) {
  //   setResponse(ctx, BAD_REQUEST);
  //   return;
  // }
  // // remove immutable fields from the payload
  // const { id, githubId: gId, createdDate, updatedDate, ...data } = inputData;
  // const result = await userRepository.save({ ...user, ...data });

  setResponse(ctx, OK, '');
};
