import { AxiosRequestConfig } from 'axios';
import getConfig from 'next/config';
import { BASE_PATH } from 'api/base';
import { Configuration } from 'api/configuration';

const { serverRuntimeConfig = {} } = getConfig() ?? {};

export function getServerAxiosProps(token?: string, baseUrl = ''): Partial<AxiosRequestConfig> {
  const { rsHost } = serverRuntimeConfig;
  return {
    baseURL: rsHost ? serverRuntimeConfig.rsHost + baseUrl : baseUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
}

export function getApiConfiguration(token?: string): Configuration {
  const props = getServerAxiosProps(token, BASE_PATH);
  return new Configuration({ basePath: props.baseURL, baseOptions: props });
}
