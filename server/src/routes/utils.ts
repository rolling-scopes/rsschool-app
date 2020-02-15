import { IApiResponse } from '../models';
import Router from '@koa/router';
import * as crypto from 'crypto';

export function setResponse<T>(ctx: Router.RouterContext, status: number, data?: T, cacheTimeSeconds: number = 0) {
  ctx.status = status;
  ctx.body = { data } as IApiResponse<T>;
  ctx.res.setHeader('Cache-Control', cacheTimeSeconds > 0 ? `public, max-age=${cacheTimeSeconds}` : 'no-cache');
  return ctx;
}

export function setErrorResponse<T>(ctx: Router.RouterContext, status: number, message: string) {
  ctx.status = status;
  ctx.body = { error: { message } } as IApiResponse<T>;
  ctx.res.setHeader('Cache-Control', 'no-cache');
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

export function setIcalResponse(ctx: Router.RouterContext, data: string) {
  ctx.status = 200;
  ctx.body = data;
  ctx.res.setHeader('Content-Type', 'text/calendar');
  return ctx;
}

export function createComparisonSignature(body: any, secret: string) {
  const hmac = crypto.createHmac('sha1', secret);
  const selfSignature = hmac.update(JSON.stringify(body)).digest('hex');
  return `sha1=${selfSignature}`;
}

export function compareSignatures(signature: string, comparisonSignature: string) {
  const source = Buffer.from(signature);
  const comparison = Buffer.from(comparisonSignature);
  return crypto.timingSafeEqual(source, comparison);
}
