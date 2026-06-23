import Router from '@koa/router';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { adminGuard, RouterContext } from '../guards';
import { OperationResult, userService } from '../../services';

const postUsers = (_: ILogger) => async (ctx: RouterContext) => {
  const data = ctx.request.body as { githubId: string }[];

  const result: OperationResult[] = [];
  for await (const item of data) {
    try {
      const userRepository = getRepository(User);
      const entity = await userRepository.findOne({ where: { githubId: item.githubId.toLowerCase() } });

      if (entity == null) {
        const user = await userRepository.save(item);
        result.push({ status: 'created', value: `GithubId: ${item.githubId}, UserId: ${user.id}` });
      } else {
        const user = await userRepository.save({ ...entity, ...item });
        result.push({ status: 'updated', value: `GithubId: ${item.githubId}, UserId: ${user.id}` });
      }
    } catch (e) {
      result.push({ status: 'failed', value: `GithubId: ${item.githubId}. Error: ${(e as Error).message}` });
    }
  }

  setResponse(ctx, OK, result);
};

const postUserActivist = (_: ILogger) => async (ctx: RouterContext) => {
  const data = ctx.request.body as { activist: boolean };
  const userId: number = ctx.params.userId;
  const user = await userService.getUserById(userId);
  if (user == null) {
    setResponse(ctx, BAD_REQUEST, 'no user');
    return;
  }
  user.activist = !!data.activist;
  await userService.saveUser(user);
  setResponse(ctx, OK);
};

export function usersRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/users' });

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

  /**
   * @swagger
   *
   * /users:
   *   post:
   *      description: Update user activist status
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: operation status
   */
  router.post('/{userId}/activist', adminGuard, postUserActivist(logger));

  return router;
}
