import { IApiResponse } from '../models';
import Router from '@koa/router';
import moment from 'moment-timezone';

export function setResponse<T>(
  ctx: Router.RouterContext | Router.RouterContext<any, any>,
  status: number,
  data?: T,
  cacheTimeSeconds: number = 0,
) {
  ctx.status = status;
  ctx.body = { data } as IApiResponse<T>;
  ctx.res.setHeader('Cache-Control', cacheTimeSeconds > 0 ? `public, max-age=${cacheTimeSeconds}` : 'no-cache');
  return ctx;
}

export function setErrorResponse<T>(
  ctx: Router.RouterContext | Router.RouterContext<any, any>,
  status: number,
  message: string,
) {
  ctx.status = status;
  ctx.body = { error: { message } } as IApiResponse<T>;
  ctx.res.setHeader('Cache-Control', 'no-cache');
  return ctx;
}

export function setCsvResponse(
  ctx: Router.RouterContext | Router.RouterContext<any, any>,
  status: number,
  data: string,
  filename = 'csv',
) {
  ctx.status = status;
  ctx.body = data;
  ctx.res.setHeader('Content-Type', 'text/csv');
  if (filename) {
    ctx.res.setHeader('Content-disposition', `filename="${filename}.csv"`);
  }
  return ctx;
}

export const dateFormatter = (date: string, timeZone: string, format: string) =>
  date ? moment(date).tz(timeZone).format(format) : '';
