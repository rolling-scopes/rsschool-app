import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { Task, TaskVerification } from '../../models';
import { createGetRoute, createPostRoute, createPutRoute } from '../common';
import { guard, anyCourseManagerGuard, adminGuard, basicAuthAws } from '../guards';
import { setResponse } from '../utils';
import { getRepository } from 'typeorm';
import { ScoreService } from '../../services/score';

const validateTaskId = async (ctx: Router.RouterContext, next: any) => {
  const stageId = Number(ctx.params.id);
  if (isNaN(stageId)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Task Id]');
    return;
  }
  ctx.params.id = stageId;
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

    const result = (await getRepository(TaskVerification).findOne(id))!;

    const service = new ScoreService();
    await service.saveScore(result.studentId, result.courseTaskId, {
      comment: result.details,
      score: result.score,
    });

    setResponse(ctx, OK, result);
  } catch (e) {
    if (logger) {
      logger.error(e.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export function taskRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/task' });

  router.post('/verification', adminGuard, createPostRoute(TaskVerification, logger));
  router.put('/verification/:id', basicAuthAws, validateTaskId, updateVerification(logger));

  router.get('/:id', guard, createGetRoute(Task, logger));
  router.post('/', anyCourseManagerGuard, createPostRoute(Task, logger));
  router.put('/:id', anyCourseManagerGuard, validateTaskId, createPutRoute(Task, logger));

  return router;
}
