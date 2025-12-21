import { CourseStatsApi, ExpelledStatsDto } from '@client/api';
import { useRequest } from 'ahooks';
import { useState } from 'react';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await courseStatsApi.deleteExpelledStat(id);
      if (typeof refresh === 'function') {
        refresh();
      }
    } catch (err) {
      console.error('Error deleting stat:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    data,
    error,
    loading,
    isDeleting,
    handleDelete,
  };
};
