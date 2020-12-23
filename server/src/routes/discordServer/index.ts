import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from '@koa/router';
import { Next } from 'koa';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { DiscordServer } from '../../models';
import { createDeleteRoute, createGetRoute, createPostRoute, createPutRoute } from '../common';
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

const getDiscordServers = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const discordServers = await getRepository(DiscordServer).createQueryBuilder('discord_server').getMany();
  setResponse(ctx, OK, discordServers);
};

export function discordServerRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/discord-server' });

  router.get('/', adminGuard, getDiscordServers(logger));
  router.post('/', adminGuard, createPostRoute(DiscordServer, logger));
  router.get('/:id', adminGuard, validateId, createGetRoute(DiscordServer, logger));
  router.put('/:id', adminGuard, validateId, createPutRoute(DiscordServer, logger));
  router.delete('/:id', adminGuard, validateId, createDeleteRoute(DiscordServer, logger));

  return router;
}
