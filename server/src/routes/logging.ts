import Router from '@koa/router';
import { Next } from 'koa';
import { ILogger, sendError } from '../logger';

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
    const error = err as Error & { status?: number };
    if (error?.message === 'Unauthorized') {
      logger.info('Unauthorized request');
    } else {
      logger.error(error);
      await sendError(error);
    }
    ctx.status = error.status || 500;
    ctx.body = JSON.stringify({
      message: error.message,
    });
  }
};
