import type { API, APIRequestResult, GetList, QueryStringOptions } from '@/common/types';
import { BASE } from '../common/const';
import { FetchMethod } from '../common/enums/fetch-methods';
import { apiRequest } from './api-request';

const credentials = 'include';
const contentTypeHeader: HeadersInit = {
  'Content-Type': 'application/json',
};

const makeParamString = (options: QueryStringOptions) => {
  let url = `?`;

  Object.keys(options).forEach((key) => {
    if (options[key as keyof QueryStringOptions]) url += `${key}=${options[key as keyof QueryStringOptions]}&`;
  });

  return url.slice(0, -1);
};

export class APIService<T> implements API<T> {
  constructor(private endpoint: string) {
    this.endpoint = `${BASE}/${endpoint}`;
  }

  public getAllList(): Promise<APIRequestResult<T[]>> {
    const url = `${this.endpoint}`;
    const config: RequestInit = {
      method: FetchMethod.get,
      credentials,
    };

    return apiRequest(url, config);
  }

  public getByOptions(options: QueryStringOptions): Promise<APIRequestResult<GetList<T>>> {
    const param = makeParamString(options);

    const url = `${this.endpoint}${param}`;
    const config: RequestInit = {
      method: FetchMethod.get,
      credentials,
    };

    return apiRequest(url, config);
  }

  public getAll(
    page: number,
    limit: number,
    order: string,
    searchText: string,
    filter: string,
    userId: string
  ): Promise<APIRequestResult<GetList<T>>> {
    const param = makeParamString({
      userId,
      page: page.toString(),
      limit: limit.toString(),
      order,
      searchText,
      filter,
    });

    const url = `${this.endpoint}${param}`;
    const config: RequestInit = {
      method: FetchMethod.get,
      credentials,
    };

    return apiRequest(url, config);
  }

  public getById(id: string): Promise<APIRequestResult<T>> {
    const url = `${this.endpoint}/${id}`;
    const config: RequestInit = {
      method: FetchMethod.get,
      credentials,
    };

    return apiRequest(url, config);
  }

  public create(body: T): Promise<APIRequestResult<T>> {
    const url = `${this.endpoint}`;
    const config: RequestInit = {
      method: FetchMethod.post,
      credentials,
      body: JSON.stringify(body),
      headers: contentTypeHeader,
    };

    return apiRequest(url, config);
  }

  public createImage(body: FormData): Promise<APIRequestResult<T>> {
    const url = `${this.endpoint}`;
    const config: RequestInit = {
      method: FetchMethod.post,
      credentials,
      body,
    };

    return apiRequest(url, config);
  }

  public updateById(id: string, body: Partial<T>): Promise<APIRequestResult<Partial<T>>> {
    const url = `${this.endpoint}/${id}`;
    const config: RequestInit = {
      method: FetchMethod.put,
      credentials,
      body: JSON.stringify(body),
      headers: contentTypeHeader,
    };

    return apiRequest(url, config);
  }

  public updateByIdAndImage(id: string, body: FormData): Promise<APIRequestResult<Partial<T>>> {
    const url = `${this.endpoint}/${id}`;
    const config: RequestInit = {
      method: FetchMethod.put,
      credentials,
      body,
    };

    return apiRequest(url, config);
  }

  public update(body: Partial<T>): Promise<APIRequestResult<Partial<T>>> {
    const url = `${this.endpoint}`;
    const config: RequestInit = {
      method: FetchMethod.put,
      credentials,
      body: JSON.stringify(body),
      headers: contentTypeHeader,
    };

    return apiRequest(url, config);
  }

  public deleteById(id: string): Promise<APIRequestResult<T>> {
    const url = `${this.endpoint}/${id}`;
    const config: RequestInit = {
      method: FetchMethod.delete,
      credentials,
    };

    return apiRequest(url, config);
  }
}

export default APIService;
