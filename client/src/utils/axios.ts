import { AxiosRequestConfig } from 'axios';
import { NextPageContext, GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export function getServerAxiosProps(
  ctx?: NextPageContext | GetServerSidePropsContext,
  baseUrl = '',
): Partial<AxiosRequestConfig> {
  const { rsHost } = serverRuntimeConfig;
  return {
    baseURL: rsHost ? serverRuntimeConfig.rsHost + baseUrl : baseUrl,
    headers: ctx?.req?.headers?.cookie
      ? {
        cookie: ctx.req.headers.cookie,
      }
      : undefined,
  };
}
