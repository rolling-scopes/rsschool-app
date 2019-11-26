import Router from 'koa-router';

export interface ILog {
  data?: any;
  host: string;
  method: string;
  query: string;
  remoteAddress: string;
  statusCode: number;
  url: string;
  userAgent: string;
  userId?: string;
}

type ErrorObj = {
  err: Partial<Error>;
};

export interface ILogger {
  info(obj: object | string, ...params: any[]): void;
  warn(obj: object | string, ...params: any[]): void;
  error(obj: Error | ErrorObj | string, ...params: any[]): void;
  child(options: { module: string; userId?: string }): ILogger;
}

export const loggerMiddleware = (externalLogger: ILogger) => async (
  ctx: Router.RouterContext<any, { logger: ILogger }>,
  next: () => Promise<any>,
) => {
  const logger = externalLogger;

  const data: Partial<ILog> = {
    host: ctx.headers.host,
    method: ctx.method,
    query: ctx.query,
    remoteAddress: ctx.request.ip,
    statusCode: ctx.status,
    url: ctx.url,
  };
  try {
    ctx.logger = logger;
    await next();
    data.statusCode = ctx.status;
  } catch (e) {
    logger.error(e);
    data.statusCode = e.status;
  }
  logger.info(
    {
      ...data,
      userId: ctx.state && ctx.state.user ? ctx.state.user.id : undefined,
    },
    'Processed request',
  );
};
