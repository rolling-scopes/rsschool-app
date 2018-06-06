import * as Koa from 'koa';

export interface ILog {
    method: string;
    url: string;
    query: string;
    data?: any;
    remoteAddress: string;
    host: string;
    userAgent: string;
    statusCode: number;
}

type LoggerMiddleware = (logger: ILogger) => Koa.Middleware;
type ErrorObj = {
    err: Partial<Error>;
};

export interface ILogger {
    info(obj: object | string, ...params: any[]): void;
    warn(obj: object | string, ...params: any[]): void;
    error(obj: Error | ErrorObj | string, ...params: any[]): void;
    child(options: { module: string }): ILogger;
}

/**
 * Log to stdout
 *
 * @param {Koa.Context} ctx
 * @param {callback} next
 * @todo make stdout an option for testing and production-level logging
 */
export const loggerMiddleware: LoggerMiddleware = (externalLogger: ILogger) => async (
    ctx: Koa.Context,
    next: () => Promise<any>,
) => {
    const data: Partial<ILog> = {
        // data: ctx.request.body,
        host: ctx.headers.host,
        method: ctx.method,
        query: ctx.query,
        remoteAddress: ctx.request.ip,
        statusCode: ctx.status,
        url: ctx.url,
        // userAgent: ctx.headers['user-agent'],
    };

    try {
        await next();
        data.statusCode = ctx.status;
    } catch (e) {
        externalLogger.error(e);
        data.statusCode = e.status;
    }
    externalLogger.info(data, 'Processed request');
};
