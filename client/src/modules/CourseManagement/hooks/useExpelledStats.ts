import { useRequest } from 'ahooks';
import { useState } from 'react';

export interface DetailedExpelledStat {
  id: string;
  course: {
    id: string;
    name: string;
    fullName: string;
    alias: string;
    description: string;
    logo: string;
  };
  user: {
    id: string;
    githubId: string;
  };
  reasonForLeaving: string[];
  otherComment: string;
  submittedAt: string;
}

const fetchExpelledStats = async (): Promise<DetailedExpelledStat[]> => {
  const response = await fetch('/api/course/stats/expelled');
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json() as Promise<DetailedExpelledStat[]>;
};

export const useExpelledStats = () => {
  const { data, error, loading, refresh } = useRequest(fetchExpelledStats);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/course/stats/expelled/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete stat');
      }
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
