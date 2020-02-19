import Router from '@koa/router';
import { OK } from 'http-status-codes';
import * as url from 'url';
import { ILogger } from '../../logger';
import { Task } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { adminGuard } from '../guards';
import { OperationResult } from '../../services/operationResult';

type TaskInput = {
  name: string;
  descriptionUrl?: string;
};

const postTasks = (logger: ILogger) => async (ctx: Router.RouterContext) => {
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

const getTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const tasks = await getRepository(Task)
    .createQueryBuilder()
    .getMany();

  setResponse(ctx, OK, tasks);
};

export function tasksRoute(logger: ILogger) {
  const router = new Router({ prefix: '/tasks' });

  /**
   * @swagger
   *
   * /tasks:
   *   post:
   *      description: Add/Update tasks
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: operation status
   */
  router.post('/', adminGuard, postTasks(logger));

  /**
   * @swagger
   *
   * /tasks:
   *   get:
   *      description: Gets tasks
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: List of tasks
   */
  router.get('/', getTasks(logger));

  return router;
}
