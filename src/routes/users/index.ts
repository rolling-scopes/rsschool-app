import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { adminGuard } from '../guards';

const postUsers = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data = ctx.request.body;

  const response = [];
  for await (const item of data) {
    console.time(item.githubId);

    try {
      const userRepository = getRepository(User);
      const entity = await userRepository.findOne({ where: { githubId: item.githubId } });

      if (entity == null) {
        await userRepository.save(item);
        response.push(`added: ${item.githubId}`);
      } else {
        await userRepository.save({ ...entity, ...item });
        response.push(`updated: ${item.githubId}`);
      }
    } catch (e) {
      response.push(`failed: ${item.githubId}`);
    }

    console.timeEnd(item.githubId);
  }

  setResponse(ctx, OK, response);
};

export function usersRoute(logger: ILogger) {
  const router = new Router({ prefix: '/users' });

  /**
   * @swagger
   *
   * /users:
   *   post:
   *      description: Add/Update users
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: operation status
   */
  router.post('/', adminGuard, postUsers(logger));

  return router;
}
