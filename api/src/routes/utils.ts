import { IApiResponse } from '../models';
import * as Router from 'koa-router';

export function setResponse<T>(ctx: Router.RouterContext, status: number, data?: T) {
  ctx.status = status;
  ctx.body = {
    data,
  } as IApiResponse<T>;
  return ctx;
}

export function setCsvResponse(ctx: Router.RouterContext, status: number, data: string, filename = 'csv') {
  ctx.status = status;
  ctx.body = data;
  ctx.res.setHeader('Content-Type', 'text/csv');
  if (filename) {
    ctx.res.setHeader('Content-disposition', `filename="${filename}.csv"`);
  }
  return ctx;
}
