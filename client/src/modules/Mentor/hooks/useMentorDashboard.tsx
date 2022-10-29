import { MentorsApi } from 'api';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

export function useMentorDashboard(mentorId: number | null) {
  const service = useMemo(() => new MentorsApi(), []);

  const { value: data, loading } = useAsync(async () => {
    const { data = [] } = mentorId ? await service.getMentorDashboardData(mentorId) : { data: [] };
    return data;
  }, []);

  return [data, loading] as const;
}
