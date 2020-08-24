import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { setResponse } from './utils';
import { getManager, getRepository, ObjectType } from 'typeorm';
import { ILogger } from '../logger';

export const createGetRoute = <T extends ObjectType<T>>(entity: T, _?: ILogger, relations?: string[]) => async (
  ctx: Router.RouterContext,
) => {
  const id = ctx.params.id;
  const user = await getManager().findOne(entity, Number(id), {
    relations,
  });
  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  setResponse(ctx, OK, user);
};

export const createGetAllRoute = <T extends ObjectType<T>>(
  entity: T,
  params: { take: number; skip: number },
  _?: ILogger,
  relations?: string[],
) => async (ctx: Router.RouterContext) => {
  const data = await getManager().find(entity, { relations, take: params.take || 20, skip: params.skip || 0 });
  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  setResponse(ctx, OK, data);
};

export const createPostRoute = <T extends ObjectType<T>>(entity: T, logger?: ILogger) => async (
  ctx: Router.RouterContext,
) => {
  const { id, createdDate, ...data } = ctx.request.body;
  try {
    const result = await getRepository(entity).insert(data);
    setResponse(ctx, OK, result);
  } catch (e) {
    if (logger) {
      logger.error(e.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const createPutRoute = <T extends ObjectType<T>>(entity: T, logger?: ILogger) => async (
  ctx: Router.RouterContext,
) => {
  const { id: _id, createdDate, ...data } = ctx.request.body;
  const id: number = Number(ctx.params.id);
  try {
    const result = await getRepository(entity).update(id, data);
    setResponse(ctx, OK, result);
  } catch (e) {
    if (logger) {
      logger.error(e.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const createDeleteRoute = <T extends ObjectType<T>>(entity: T, logger?: ILogger) => async (
  ctx: Router.RouterContext,
) => {
  const id: number = ctx.params.id;
  try {
    const result = await getRepository(entity).delete(id);
    setResponse(ctx, OK, result);
  } catch (e) {
    if (logger) {
      logger.error(e.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};
