import Router from '@koa/router';
import { OK } from 'http-status-codes';
import * as url from 'url';
import { ILogger } from '../../logger';
import { Task } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { adminGuard, RouterContext } from '../guards';
import { OperationResult } from '../../services/operationResult';

type TaskInput = {
  name: string;
  descriptionUrl?: string;
};

const postTasks = (logger: ILogger) => async (ctx: RouterContext) => {
  const data: TaskInput[] = ctx.request.body;

  const response: OperationResult[] = [];

  for await (const item of data) {
    try {
      if (item.descriptionUrl) {
        try {
          new url.URL(item.descriptionUrl);
        } catch (e) {
          const message = `[${item.descriptionUrl}] is not url`;
          response.push({ status: 'failed', value: message });
          continue;
        }
      }
      const result = await getRepository(Task).save(item);
      response.push({ status: 'created', value: result.id });
    } catch (e) {
      logger.error(e);
      response.push({ status: 'failed', value: item.name });
    }
  }

  setResponse(ctx, OK, response);
};

const getTasks = (_: ILogger) => async (ctx: RouterContext) => {
  const tasks = await getRepository(Task).find({
    relations: ['discipline'],
    order: {
      updatedDate: 'DESC',
    },
  });
  setResponse(ctx, OK, tasks);
};

export function tasksRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/tasks' });

  router.post('/', adminGuard, postTasks(logger));
  router.get('/', getTasks(logger));

  return router;
}
