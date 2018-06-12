import * as Router from 'koa-router';

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

type ErrorObj = {
    err: Partial<Error>;
};

export interface ILogger {
    info(obj: object | string, ...params: any[]): void;
    warn(obj: object | string, ...params: any[]): void;
    error(obj: Error | ErrorObj | string, ...params: any[]): void;
    child(options: { module: string }): ILogger;
}

export const loggerMiddleware = (externalLogger: ILogger) => async (
    ctx: Router.IRouterContext,
    next: () => Promise<any>,
) => {
    const data: Partial<ILog> = {
        data: ctx.request.body,
        host: ctx.headers.host,
        method: ctx.method,
        query: ctx.query,
        remoteAddress: ctx.request.ip,
        statusCode: ctx.status,
        url: ctx.url,
    };

    try {
        ctx.logger = externalLogger;
        await next();
        data.statusCode = ctx.status;
    } catch (e) {
        externalLogger.error(e);
        data.statusCode = e.status;
    }
    externalLogger.info(data, 'Processed request');
};
