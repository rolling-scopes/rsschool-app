import Router from 'koa-router';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { adminGuard, guard } from '../guards';
import { OperationResult, userService } from '../../services';

const postUsers = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data = ctx.request.body as { githubId: string }[];

  const result: OperationResult[] = [];
  for await (const item of data) {
    console.time(item.githubId);

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
      result.push({ status: 'failed', value: `GithubId: ${item.githubId}. Error: ${e.message}` });
    }

    console.timeEnd(item.githubId);
  }

  setResponse(ctx, OK, result);
};

const getSearchByGithubId = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const searchText = ctx.params.searchText;
  if (!searchText) {
    setResponse(ctx, OK, []);
    return;
  }

  const entities = await getRepository(User)
    .createQueryBuilder('user')
    .where('user.githubId like :text OR user.firstName ilike :text OR user.lastName ilike :text', {
      text: searchText.toLowerCase() + '%',
    })
    .limit(20)
    .getMany();

  setResponse(
    ctx,
    OK,
    entities.map(user => ({
      id: user.id,
      githubId: user.githubId,
      firstName: user.firstName,
      lastName: user.lastName,
    })),
  );
};

const postUserActivist = (_: ILogger) => async (ctx: Router.RouterContext) => {
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

  /**
   * @swagger
   *
   * /users/search/:searchText:
   *   post:
   *      description: Search users
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: operation status
   */
  router.get('/search/:searchText', guard, getSearchByGithubId(logger));

  return router;
}
