import isNil from 'lodash/isNil';
import { ParsedUrlQuery } from 'querystring';
import { onlyDefined } from './onlyDefined';

export const getQueryParams = (
  queryParams: { [key: string]: string | string[] | null | undefined },
  initialQueryParams: ParsedUrlQuery = {},
): ParsedUrlQuery => {
  let params = { ...initialQueryParams };
  for (const [key, value] of Object.entries(queryParams)) {
    if (!isNil(value)) {
      if (Array.isArray(value)) {
        const trimmedElements = value.map(elem => elem.trim()).join(',');
        if (trimmedElements !== '') {
          params = { ...params, [key]: trimmedElements };
        }
      } else if (typeof value === 'string' && value !== '') {
        params = { ...params, [key]: value.trim() };
      }
    }
  }

  return params;
};

export const getQueryString = (params = {}): string => {
  const queryParams = new URLSearchParams({
    ...(onlyDefined(params) as object),
  });
  const queryString = queryParams.toString();
  return queryString && `?${queryString}`;
};
