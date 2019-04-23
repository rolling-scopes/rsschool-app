import * as Router from 'koa-router';

export const routeLoggerMiddleware: Router.IMiddleware = async (ctx: Router.RouterContext, next: any) => {
  const oldLogger = ctx.logger;
  const userId = ctx.state && ctx.state.user ? ctx.state.user._id : undefined;
  ctx.logger = ctx.logger.child({ module: 'route', userId });
  await next();
  ctx.logger = oldLogger;
};
