import { useMessage } from '@client/hooks';
import { CourseAggregateStatsDto, CourseStatsApi } from '@client/api';
import { useRequest } from 'ahooks';

const courseStatsApi = new CourseStatsApi();

type CourseStatsParams = {
  ids?: number[];
  year?: number;
};

async function fetchCourseStats({
  ids = [],
  year = 0,
}: CourseStatsParams): Promise<CourseAggregateStatsDto | undefined> {
  try {
    const { data } = await courseStatsApi.getCoursesStats(ids.map(String), year);
    return data;
  } catch (err) {
    console.error("Couldn't get course(s) stats", err);
    throw err;
  }
}

export function useCoursesStats({ ids, year }: CourseStatsParams) {
  const { message } = useMessage();

  const { data, loading } = useRequest(() => fetchCourseStats({ ids, year }), {
    ready: Boolean((ids && ids.length) || year),
    refreshDeps: [ids, year],
    retryCount: 3,
    onError: () => {
      message.error("Can't load courses data. Please try later.");
    },
  });

  return { loading, coursesData: data };
}
