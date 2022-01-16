import { AxiosRequestConfig } from 'axios';
import getConfig from 'next/config';

const { serverRuntimeConfig = {} } = getConfig() ?? {};

export function getServerAxiosProps(token?: string, baseUrl = ''): Partial<AxiosRequestConfig> {
  const { rsHost } = serverRuntimeConfig;
  return {
    baseURL: rsHost ? serverRuntimeConfig.rsHost + baseUrl : baseUrl,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  };
}
