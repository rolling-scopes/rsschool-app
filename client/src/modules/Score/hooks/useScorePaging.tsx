import { NextRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback } from 'react';
import { CourseService } from 'services/course';
import { getQueryParams } from 'utils/queryParams-utils';
import { IPaginationInfo } from 'common/types/pagination';
import { ScoreOrder, ScoreTableFilters } from 'common/types/score';

export function useScorePaging(router: NextRouter, courseService: CourseService, activeOnly: boolean) {
  const { ['mentor.githubId']: mentor, cityName, ...currentQuery } = router.query;

  const setQueryParams = useCallback(
    (query: ParsedUrlQuery) => {
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router],
  );

  const getCourseScore = useCallback(
    async (pagination: IPaginationInfo, filters: ScoreTableFilters, scoreOrder: ScoreOrder) => {
      const { cityName, ['mentor.githubId']: mentor } = filters;
      const newQueryParams = getQueryParams({ cityName, ['mentor.githubId']: mentor }, currentQuery);
      setQueryParams(newQueryParams);
      const field = scoreOrder.column?.sorter || 'rank';
      const courseScore = await courseService.getCourseScore(
        pagination,
        { ...filters, activeOnly },
        { field, order: scoreOrder.order },
      );
      return { content: courseScore.content, pagination: courseScore.pagination };
    },
    [currentQuery, activeOnly],
  );

  return [getCourseScore];
}
