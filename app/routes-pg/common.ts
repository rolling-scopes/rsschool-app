import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import * as Router from 'koa-router';
import { setResponse } from '../routes/utils';
import { getManager } from 'typeorm';
import { ILogger } from '../logger';

export const createGetRoute = <T = any>(entity: T, _?: ILogger) => async (ctx: Router.RouterContext) => {
    const id = ctx.params.id;
    const user = await getManager().findOne(entity as any, Number(id));
    if (user === undefined) {
        setResponse(ctx, NOT_FOUND);
        return;
    }
    setResponse(ctx, OK, user);
};

export const createPostRoute = <T = any>(entity: T, logger?: ILogger) => async (ctx: Router.RouterContext) => {
    const data = ctx.request.body;
    try {
        const result = await getManager().save(entity as any, data);
        setResponse(ctx, OK, result);
    } catch (e) {
        if (logger) {
            logger.error(e.message);
        }
        setResponse(ctx, BAD_REQUEST, { message: e.message });
    }
};
