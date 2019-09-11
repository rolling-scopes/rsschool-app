import Router from 'koa-router';
import { ILogger } from '../logger';

export const routeLoggerMiddleware: Router.IMiddleware = async (ctx: Router.RouterContext, next: any) => {
  const oldLogger = ctx.logger;
  const userId = ctx.state && ctx.state.user ? ctx.state.user.id : undefined;
  ctx.logger = ctx.logger.child({ module: 'route', userId });
  await next();
  ctx.logger = oldLogger;
};

export const errorHandlerMiddleware = (logger: ILogger) => async (ctx: Router.RouterContext, next: any) => {
  try {
    await next();
  } catch (err) {
    logger.error(err);
    ctx.status = err.status || 500;
    ctx.body = JSON.stringify({
      message: err.message,
    });
  }
};
