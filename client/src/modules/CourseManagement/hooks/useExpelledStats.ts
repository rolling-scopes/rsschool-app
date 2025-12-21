import { CourseStatsApi, ExpelledStatsDto } from '@client/api/api';
import { useRequest } from 'ahooks';
import { useState } from 'react';

export interface DetailedExpelledStat {
  id: string;
  course: {
    id: number;
    name: string;
    fullName: string;
    alias: string;
    description: string;
    logo: string;
  };
  user: {
    id: number;
    githubId: string;
  };
  reasonForLeaving?: string[];
  otherComment: string;
  submittedAt: Date;
}

const api = new CourseStatsApi();

const fetchExpelledStats = async (): Promise<ExpelledStatsDto[]> => {
  const response = await api.getExpelledStats();
  return response.data;
};

export const useExpelledStats = () => {
  const { data, error, loading } = useRequest(fetchExpelledStats);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.deleteExpelledStat(id);
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
