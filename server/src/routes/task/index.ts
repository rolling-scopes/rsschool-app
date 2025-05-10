import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { TaskVerification } from '../../models';
import { ScoreService } from '../../services/score';
import { createPostRoute } from '../common';
import { adminGuard, basicAuthAws } from '../guards';
import { setResponse } from '../utils';

const validateTaskId = async (ctx: Router.RouterContext, next: any) => {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Task Id]');
    return;
  }
  ctx.params.id = id;
  await next();
};

const updateVerification = (logger?: ILogger) => async (ctx: Router.RouterContext) => {
  const { createdDate, ...data } = ctx.request.body as {
    createdDate: string;
    score: number;
    details: string;
    status: any;
  };

  const id: number = Number(ctx.params.id);
  try {
    const score = Math.round(Number(data.score));
    await getRepository(TaskVerification).save({ ...data, score, id });

    const result = (await getRepository(TaskVerification).findOneBy({ id }))!;

    const service = new ScoreService(0);
    await service.saveScore(result.studentId, result.courseTaskId, {
      comment: result.details,
      score: result.score,
    });

    setResponse(ctx, OK, result);
  } catch (err) {
    if (logger) {
      logger.error((err as Error).message);
    }
    setResponse(ctx, BAD_REQUEST, { message: (err as Error).message });
  }
};

export function taskRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/task' });

  router.post('/verification', adminGuard, createPostRoute(TaskVerification, logger));
  router.put('/verification/:id', basicAuthAws, validateTaskId, updateVerification(logger));

  return router;
}
