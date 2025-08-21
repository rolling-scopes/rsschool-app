import { useCallback, useEffect, useState } from 'react';
import { useMessage } from '@client/hooks';
import { memoize } from 'lodash';
import { CoursesStatsDto, CourseStatsApi } from '@client/api';

const courseStatsApi = new CourseStatsApi();

async function fetchCourseStats(ids: number[]): Promise<CoursesStatsDto | { error: boolean }> {
  try {
    const { data } = await courseStatsApi.getCoursesStats(ids, 0);
    return data;
  } catch {
    console.error("Couldn't get course(s) stats");
    return { error: true };
  }
}

export function useCoursesStats(ids: number[]) {
  const [loading, setLoading] = useState<boolean>(false);
  const [coursesData, setCoursesData] = useState<CoursesStatsDto>();
  const { message } = useMessage();

  const cached = useCallback(memoize(fetchCourseStats), []);

  useEffect(() => {
    if (ids.length === 0) {
      return;
    }
    setLoading(true);
    cached(ids).then(result => {
      setLoading(false);
      if (result && 'error' in result) {
        message.error("Can't load courses data. Please try latter.");
      } else {
        setCoursesData(result);
      }
    });
  }, [ids, cached]);

  return { loading, coursesData };
}
