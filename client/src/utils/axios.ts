import { AxiosRequestConfig } from 'axios';
import getConfig from 'next/config';
import { BASE_PATH } from 'api/base';

const { serverRuntimeConfig = {} } = getConfig() ?? {};

export function getServerAxiosProps(token?: string, baseUrl = ''): Partial<AxiosRequestConfig> {
  const { rsHost } = serverRuntimeConfig;
  return {
    baseURL: rsHost ? serverRuntimeConfig.rsHost + baseUrl : baseUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
}

export function getNestServerProps(token?: string, baseUrl = BASE_PATH): Partial<AxiosRequestConfig> {
  return getServerAxiosProps(token, baseUrl);
}
