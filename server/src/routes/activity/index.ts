import Router from 'koa-router';
import { OK, BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse, createComparisonSignature, compareSignatures } from '../utils';
import { guard } from '../guards';
import { config } from '../../config';

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

const postActivityByWebhook = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { headers, body } = ctx.request;
  const signature = headers['x-hub-signature'];

  if (!signature) {
    setResponse(ctx, UNAUTHORIZED);
    return;
  }

  const comparisonSignature = createComparisonSignature(body, config.auth.activityWebhookSecret);
  if (!compareSignatures(signature, comparisonSignature)) {
    setResponse(ctx, UNAUTHORIZED);
    return;
  }

  const { sender } = body;
  if (!sender || !sender.login) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const githubId = sender.login;
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { githubId } });
  if (!user) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const now = Date.now();
  const isActive = true;
  user.lastActivityTime = now;
  user.isActive = isActive;
  await getRepository(User).save(user);
  setResponse(ctx, OK, { lastActivityTime: now });
};

export function activityRoute(logger: ILogger) {
  const router = new Router({ prefix: '/activity' });

  router.post('/', guard, postActivity(logger));

  router.get('/', guard, getActivity(logger));

  router.post('/webhook', postActivityByWebhook(logger));

  return router;
}
