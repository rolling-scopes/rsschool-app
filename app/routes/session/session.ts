import { NOT_FOUND, OK } from 'http-status-codes';
import * as Router from 'koa-router';
import { setResponse } from '../utils';

export const sessionRoute = (ctx: Router.IRouterContext) => {
    if (ctx.state.user == null) {
        setResponse(ctx, NOT_FOUND);
        return;
    }
    setResponse(ctx, OK, ctx.state.user);
};
