import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from '@koa/router';
import { Next } from 'koa';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { UserGroup, User } from '../../models';
import { createDeleteRoute, createPostRoute, createPutRoute } from '../common';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';

const validateId = async (ctx: Router.RouterContext, next: Next) => {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Id]');
    return;
  }
  ctx.params.id = id;
  await next();
};

const getUserGroups = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const userGroupsRaw = await getRepository(UserGroup).find();
  const usersIds = [...new Set(userGroupsRaw.reduce((acc, { users }) => [...acc, ...users], [] as number[]))];
  const usersRaw = await getRepository(User).createQueryBuilder('user').whereInIds(usersIds).getMany();

  const usersGroups = userGroupsRaw
    .map(g => ({
      id: g.id,
      name: g.name,
      roles: g.roles,
      users: g.users.map(userId => {
        const user = usersRaw.find(ur => ur.id === userId) ?? {
          id: -1,
          githubId: 'UNKNOWN',
          firstName: '',
          lastName: '',
        };

        return {
          id: user.id,
          githubId: user.githubId,
          name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        };
      }),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  setResponse(ctx, OK, usersGroups);
};

export function userGroupRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/user-group' });

  router.get('/', adminGuard, getUserGroups(logger));
  router.post('/', adminGuard, createPostRoute(UserGroup, logger));
  router.put('/:id', adminGuard, validateId, createPutRoute(UserGroup, logger));
  router.delete('/:id', adminGuard, validateId, createDeleteRoute(UserGroup, logger));

  return router;
}
