import { AxiosRequestConfig } from 'axios';
import { NextPageContext } from 'next';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export function getServerAxiosProps(ctx?: NextPageContext): Partial<AxiosRequestConfig> {
  return {
    baseURL: serverRuntimeConfig.rsHost || '',
    headers:
      ctx && ctx.req
        ? {
            cookie: ctx.req.headers.cookie,
          }
        : undefined,
  };
}
