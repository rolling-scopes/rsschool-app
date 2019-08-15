import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { guard } from '../guards';

const postActivity = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const userId = ctx.state.user.id;
  const user = await getRepository(User).findOne(userId);
  const input: { isActive: boolean } = ctx.request.body;
  const now = Date.now();
  user!.lastActivityTime = now;
  user!.isActive = !!input.isActive;
  await getRepository(User).save(user!);
  setResponse(ctx, OK, { lastActivityTime: now });
};

const getActivity = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const userId = ctx.state.user.id;
  const { lastActivityTime, isActive } = (await getRepository(User).findOne(userId))!;
  setResponse(ctx, OK, { lastActivityTime: Number(lastActivityTime), isActive });
};

export function activityRoute(logger: ILogger) {
  const router = new Router({ prefix: '/activity' });

  router.post('/', guard, postActivity(logger));

  router.get('/', guard, getActivity(logger));

  return router;
}
