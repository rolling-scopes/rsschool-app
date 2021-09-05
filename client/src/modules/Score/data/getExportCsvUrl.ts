import { getQueryParams, getQueryString } from 'utils/queryParams-utils';

export function getExportCsvUrl(courseId: number, cityName: string | string[], mentor: string | string[]) {
  const queryParams = getQueryString(getQueryParams({ cityName, ['mentor.githubId']: mentor }));
  const url = buildUrl(courseId, queryParams);
  return url;
}

const buildUrl = (id: number, params: string): string => {
  return `/api/course/${id}/students/score/csv${params}`;
};
