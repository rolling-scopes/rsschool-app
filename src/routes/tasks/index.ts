import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Task } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { adminGuard } from '../guards';

type TaskInput = {
  name: string;
};

const postTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data: TaskInput[] = ctx.request.body;

  const response = [];

  for await (const item of data) {
    try {
      const repository = getRepository(Task);
      await repository.save(item);
      response.push(`added: ${item.name}`);
    } catch (e) {
      response.push(`failed: ${item.name}`);
    }
  }

  setResponse(ctx, OK, response);
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

  return router;
}
