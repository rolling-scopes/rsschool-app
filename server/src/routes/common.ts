import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { setResponse } from './utils';
import { getManager, getRepository } from 'typeorm';
import { ILogger } from '../logger';

export const createGetRoute = <T = any>(entity: T, _?: ILogger, relations?: string[]) => async (
  ctx: Router.RouterContext,
) => {
  const id = ctx.params.id;
  const user = await getManager().findOne(entity as any, Number(id), {
    relations,
  });
  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  setResponse(ctx, OK, user);
};

export const createGetAllRoute = <T = any>(
  entity: T,
  params: { take: number; skip: number },
  _?: ILogger,
  relations?: string[],
) => async (ctx: Router.RouterContext) => {
  const data = await getManager().find(entity as any, { relations, take: params.take || 20, skip: params.skip || 0 });
  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  setResponse(ctx, OK, data);
};

export const createPostRoute = <T = any>(entity: T, logger?: ILogger) => async (ctx: Router.RouterContext) => {
  const { id, createdDate, ...data } = ctx.request.body;
  try {
    const result = await getRepository(entity as any).insert(data);
    setResponse(ctx, OK, result);
  } catch (e) {
    if (logger) {
      logger.error(e.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const createPutRoute = <T = any>(entity: T, logger?: ILogger) => async (ctx: Router.RouterContext) => {
  const { id: _id, createdDate, ...data } = ctx.request.body;
  const id: number = Number(ctx.params.id);
  try {
    const result = await getRepository(entity as any).update(id, data);
    setResponse(ctx, OK, result);
  } catch (e) {
    if (logger) {
      logger.error(e.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const createDeleteRoute = <T = any>(entity: T, logger?: ILogger) => async (ctx: Router.RouterContext) => {
  const id: number = ctx.params.id;
  try {
    const result = await getRepository(entity as any).delete(id);
    setResponse(ctx, OK, result);
  } catch (e) {
    if (logger) {
      logger.error(e.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};
