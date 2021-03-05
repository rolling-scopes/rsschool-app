import { ParsedUrlQuery } from 'querystring';
import { isArray, isNull, isUndefined } from 'lodash';
import { onlyDefined } from './onlyDefined';

export const getQueryParams = (
  queryParams: { [key: string]: string | string[] | null | undefined },
  initialQueryParams: ParsedUrlQuery = {},
): ParsedUrlQuery => {
  let params = { ...initialQueryParams };
  for (const [key, value] of Object.entries(queryParams)) {
    if (!isNull(value) && !isUndefined(value)) {
      if (isArray(value) && value[0] !== '') {
        params = { ...params, [key]: value[0] };
      } else if (typeof value === 'string' && value !== '') {
        params = { ...params, [key]: value };
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
