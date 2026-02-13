import { CourseStatsApi, ExpelledStatsDto } from '@client/api';
import { useRequest } from 'ahooks';

const courseStatsApi = new CourseStatsApi();

const fetchExpelledStats = async (courseId: number): Promise<ExpelledStatsDto[]> => {
  const response = await courseStatsApi.getCourseExpelledStats(courseId);
  return response.data;
};

export const useExpelledStats = (courseId?: number) => {
  const { data, error, loading, refresh } = useRequest(() => fetchExpelledStats(courseId as number), {
    ready: !!courseId,
    refreshDeps: [courseId],
  });

  const { runAsync: handleDelete, loading: isDeleting } = useRequest(
    async (id: string) => courseStatsApi.deleteExpelledStat(id),
    { onSuccess: refresh },
  );

  return {
    data,
    error,
    loading,
    isDeleting,
    handleDelete,
  };
};
