import * as Router from 'koa-router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import {OK } from 'http-status-codes';

export const getProfile = (logger: ILogger) => async (ctx: Router.RouterContext) => {
    logger.info(ctx);

    setResponse(ctx, OK, {});
};
