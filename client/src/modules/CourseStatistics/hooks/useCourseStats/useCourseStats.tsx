import { useCallback, useEffect, useState } from 'react';
import { useMessage } from '@client/hooks';
import { memoize } from 'lodash';
import { CoursesStatsDto, CourseStatsApi } from '@client/api';

const courseStatsApi = new CourseStatsApi();

async function fetchCourseStats({
  ids = [],
  year = 0,
}: {
  ids?: number[];
  year?: number;
}): Promise<CoursesStatsDto | { error: boolean }> {
  try {
    const { data } = await courseStatsApi.getCoursesStats(ids, year);
    return data;
  } catch {
    console.error("Couldn't get course(s) stats");
    return { error: true };
  }
}

export function useCoursesStats({ ids, year }: { ids?: number[]; year?: number }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [coursesData, setCoursesData] = useState<CoursesStatsDto>();
  const { message } = useMessage();

  const cached = useCallback(memoize(fetchCourseStats), []);

  useEffect(() => {
    setLoading(true);
    if (!ids?.length && !year) {
      setLoading(false);
      return;
    }

    cached({ ids, year }).then(result => {
      setLoading(false);
      if (result && 'error' in result) {
        message.error("Can't load courses data. Please try latter.");
      } else {
        setCoursesData(result);
      }
    });
  }, [ids, year, cached]);

  return { loading, coursesData };
}
