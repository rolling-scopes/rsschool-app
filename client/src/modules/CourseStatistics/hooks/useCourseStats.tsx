import { useMessage } from '@client/hooks';
import { CoursesStatsDto, CourseStatsApi } from '@client/api';
import { useRequest } from 'ahooks';

const courseStatsApi = new CourseStatsApi();

type CourseStatsParams = {
  ids?: number[];
  year?: number;
};

async function fetchCourseStats({ ids = [], year = 0 }: CourseStatsParams): Promise<CoursesStatsDto | undefined> {
  try {
    const { data } = await courseStatsApi.getCoursesStats(ids, year);
    return data;
  } catch {
    console.error("Couldn't get course(s) stats");
  }
}

export function useCoursesStats({ ids, year }: CourseStatsParams) {
  const { message } = useMessage();

  const service = async () => {
    if (!ids?.length && !year) {
      return;
    }
    return fetchCourseStats({ ids, year });
  };

  const { data, loading } = useRequest(service, {
    refreshDeps: [ids, year],
    retryCount: 3,
    onError: () => {
      message.error("Can't load courses data. Please try latter.");
    },
  });

  return { loading, coursesData: data };
}
