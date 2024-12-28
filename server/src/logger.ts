import Router from '@koa/router';
import { AxiosError } from 'axios';
import pinoLogger from 'pino-multi-stream';
import { ParsedUrlQuery } from 'querystring';
import { config } from './config';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cloudwatch = require('@apalchys/pino-cloudwatch'); //tslint:disable-line

export interface ILog {
  data?: any;
  host: string;
  method: string;
  query: ParsedUrlQuery;
  remoteAddress: string;
  status: number;
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

export async function sendError(err: any): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  const error = {
    message: err.message ?? '',
    cause: err ?? '',
  };
  await axios
    .post(`${config.aws.restApiUrl}/errors`, error, { headers: { 'x-api-key': config.aws.restApiKey } })
    .catch(() => null);
}

export const loggerMiddleware =
  (externalLogger: ILogger) =>
  async (ctx: Router.RouterContext<any, { logger: ILogger }>, next: () => Promise<any>) => {
    const logger = externalLogger;

    const data: Partial<ILog> = {
      status: ctx.status,
      method: ctx.method,
      url: ctx.url,
      query: ctx.query,
    };
    const start = Date.now();
    try {
      ctx.logger = logger;
      await next();
      data.status = ctx.status;
    } catch (e) {
      if ((e as AxiosError).isAxiosError) {
        const error = e as AxiosError<any>;
        logger.error(error.message, {
          data: error.response?.data,
          status: error.response?.status,
        });
        await sendError({ message: error.message, data: error.response?.data, status: error.response?.status });
      } else {
        logger.error(e as any);
        await sendError(e);
      }
      data.status = (e as any).status;
    }
    logger.info({
      msg: 'Processed request',
      duration: Date.now() - start,
      ...data,
      userId: ctx.state && ctx.state.user ? ctx.state.user.id : undefined,
    });
  };

export function createDefaultLogger() {
  const streams = [{ stream: process.stdout }];
  const { accessKeyId, secretAccessKey, region } = config.aws;
  if (process.env.NODE_ENV === 'production' && accessKeyId && secretAccessKey) {
    const writeStream = cloudwatch({
      interval: 2000,
      aws_access_key_id: accessKeyId,
      aws_secret_access_key: secretAccessKey,
      aws_region: region,
      group: '/app/rsschool-api',
      stream: `${new Date().toISOString().split('T')[0]}-server`,
    });
    streams.push(writeStream);
  }
  return pinoLogger({ streams, base: null, timestamp: false }) as ILogger;
}
