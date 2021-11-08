import { StatusCodes } from 'http-status-codes';
import Router from '@koa/router';
import { setResponse } from './utils';
import { getManager, getRepository, ObjectType } from 'typeorm';
import { ILogger } from '../logger';

const { NOT_FOUND, OK, INTERNAL_SERVER_ERROR } = StatusCodes;

export const createGetRoute =
  <T extends ObjectType<T>>(entity: T, _?: ILogger, relations?: string[]) =>
  async (ctx: Router.RouterContext) => {
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

export const createGetAllRoute =
  <T extends ObjectType<T>>(entity: T, params: { take: number; skip: number }, _?: ILogger, relations?: string[]) =>
  async (ctx: Router.RouterContext) => {
    const data = await getManager().find(entity, { relations, take: params.take || 20, skip: params.skip || 0 });
    if (data === undefined) {
      setResponse(ctx, NOT_FOUND);
      return;
    }
    setResponse(ctx, OK, data);
  };

export const createPostRoute =
  <T extends ObjectType<T>>(entity: T, logger?: ILogger) =>
  async (ctx: Router.RouterContext) => {
    const { id, createdDate, updatedDate, ...data } = ctx.request.body;
    try {
      const {
        identifiers: [identifier],
      } = await getRepository(entity).insert(data);
      const result = await getRepository(entity).findOne(identifier['id']);
      setResponse(ctx, OK, result);
    } catch (err) {
      const error = err as Error;
      if (logger) {
        logger.error(error.message);
      }
      setResponse(ctx, INTERNAL_SERVER_ERROR, { message: error.message });
    }
  };

export const createPutRoute =
  <T extends ObjectType<T>>(entity: T, logger?: ILogger) =>
  async (ctx: Router.RouterContext) => {
    const { id: _id, createdDate, ...data } = ctx.request.body;
    const id: number = Number(ctx.params.id);
    try {
      await getRepository(entity).update(id, data);
      const result = await getRepository(entity).findOne(id);
      setResponse(ctx, OK, result);
    } catch (err) {
      const error = err as Error;
      if (logger) {
        logger.error(error.message);
      }
      setResponse(ctx, INTERNAL_SERVER_ERROR, { message: error.message });
    }
  };

export const createDeleteRoute =
  <T extends ObjectType<T>>(entity: T, logger?: ILogger) =>
  async (ctx: Router.RouterContext) => {
    const id: number = ctx.params.id;
    try {
      const result = await getRepository(entity).delete(id);
      setResponse(ctx, OK, result);
    } catch (err) {
      const error = err as Error;
      if (logger) {
        logger.error(error.message);
      }
      setResponse(ctx, INTERNAL_SERVER_ERROR, { message: error.message });
    }
  };

export const createDisableRoute =
  <T extends ObjectType<{ disabled: boolean }>>(entity: T, logger?: ILogger) =>
  async (ctx: Router.RouterContext) => {
    const id: number = ctx.params.id;
    try {
      const result = await getRepository(entity).update(id, { disabled: true });
      setResponse(ctx, OK, result);
    } catch (err) {
      const error = err as Error;
      if (logger) {
        logger.error(error.message);
      }
      setResponse(ctx, INTERNAL_SERVER_ERROR, { message: error.message });
    }
  };

export const createMultiplePostRoute =
  <T extends ObjectType<T>>(entity: T, logger?: ILogger) =>
  async (ctx: Router.RouterContext) => {
    const data = ctx.request.body;

    data.forEach(async (someEntity: any) => {
      try {
        const result = await getRepository(entity).insert(someEntity);
        setResponse(ctx, OK, result);
      } catch (err) {
        const error = err as Error;
        if (logger) {
          logger.error(error.message);
        }
        setResponse(ctx, INTERNAL_SERVER_ERROR, { message: error.message });
      }
    });
  };

export const createMultiplePutRoute =
  <T extends ObjectType<T>>(entity: T, logger?: ILogger) =>
  async (ctx: Router.RouterContext) => {
    const data = ctx.request.body;

    data.forEach(async (someEntity: any) => {
      try {
        const result = await getRepository(entity).update(someEntity.id, someEntity);
        setResponse(ctx, OK, result);
      } catch (err) {
        const error = err as Error;
        if (logger) {
          logger.error(error.message);
        }
        setResponse(ctx, INTERNAL_SERVER_ERROR, { message: error.message });
      }
    });
  };
