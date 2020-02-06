import { BAD_REQUEST, OK, NOT_FOUND } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { IUserSession } from '../../models/session';
import { setResponse } from '../utils';

export const getMyProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;

  const profile = await getRepository(User).findOne({ where: { githubId } });
  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, profile);
};

export const updateMyProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;
  const inputData: Partial<User> = ctx.request.body;
  if (!inputData) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { githubId } });
  if (!user) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  // remove immutable fields from the payload
  const { id, githubId: gId, createdDate, updatedDate, ...data } = inputData;
  const result = await userRepository.save({ ...user, ...data });
  setResponse(ctx, OK, result);
};
