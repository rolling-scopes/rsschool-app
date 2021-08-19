import { NextRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback } from 'react';
import { CourseService } from 'services/course';
import { getQueryParams } from 'utils/queryParams-utils';
import { IPaginationInfo } from '../../../../../common/types/pagination';
import { ScoreOrder, ScoreTableFilters } from '../../../../../common/types/score';

export function useScorePaging(router: NextRouter, courseService: CourseService, activeOnly: boolean) {
  const { ['mentor.githubId']: mentor, cityName, ...currentQuery } = router.query;

  const setQueryParams = useCallback(
    (query: ParsedUrlQuery) => {
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router],
  );

  const getCourseScore = useCallback(
    async (pagination: IPaginationInfo, filters: ScoreTableFilters, order: ScoreOrder) => {
      const { cityName, ['mentor.githubId']: mentor } = filters;
      const newQueryParams = getQueryParams({ cityName, ['mentor.githubId']: mentor }, currentQuery);
      setQueryParams(newQueryParams);
      const field = order.column?.sorter || 'rank';
      const direction =
        field === 'rank' ? (order.order === 'descend' ? 'desc' : 'asc') : order.order === 'ascend' ? 'asc' : 'desc';
      const courseScore = await courseService.getCourseScore(
        pagination,
        { ...filters, activeOnly },
        { field, direction },
      );
      return { content: courseScore.content, pagination: courseScore.pagination };
    },
    [currentQuery, activeOnly],
  );

  return [getCourseScore];
}
