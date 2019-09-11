import { IApiResponse } from '../models';
import Router from 'koa-router';
import * as crypto from 'crypto';

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
