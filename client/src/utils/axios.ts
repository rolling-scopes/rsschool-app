import { AxiosRequestConfig } from 'axios';
import { BASE_PATH } from 'api/base';
import { Configuration } from 'api/configuration';

const rsHost = process.env.RS_HOST || process.env.NEXT_PUBLIC_RS_HOST || '';

export function getServerAxiosProps(token?: string, baseUrl = ''): Partial<AxiosRequestConfig> {
  return {
    baseURL: rsHost ? rsHost + baseUrl : baseUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
}

function getNestJsServerAxiosProps(token?: string): Partial<AxiosRequestConfig> {
  return {
    baseURL: rsHost ? rsHost + BASE_PATH : undefined,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
}

export function getApiConfiguration(token?: string): Configuration {
  const props = getNestJsServerAxiosProps(token);
  return new Configuration({ basePath: props.baseURL, baseOptions: props });
}
