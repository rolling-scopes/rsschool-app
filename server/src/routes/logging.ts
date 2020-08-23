import Router from '@koa/router';
import { Next } from 'koa';
import { ILogger } from '../logger';

export const routeLoggerMiddleware: Router.Middleware = async (ctx: Router.RouterContext<any, any>, next: Next) => {
  const oldLogger = ctx.logger;
  const userId = ctx.state && ctx.state.user ? ctx.state.user.id : undefined;
  ctx.logger = ctx.logger.child({ module: 'route', userId });
  await next();
  ctx.logger = oldLogger;
};

export const errorHandlerMiddleware = (logger: ILogger) => async (ctx: Router.RouterContext, next: Next) => {
  try {
    await next();
  } catch (err) {
    if (err?.message === 'Unauthorized') {
      logger.info('Unauthorized request');
    } else {
      logger.error(err);
    }
    ctx.status = err.status || 500;
    ctx.body = JSON.stringify({
      message: err.message,
    });
  }
};
