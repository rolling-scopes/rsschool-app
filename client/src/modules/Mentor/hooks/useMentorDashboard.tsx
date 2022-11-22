import { MentorsApi } from 'api';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

export function useMentorDashboard(mentorId: number, courseId: number, hasChanged: boolean) {
  const service = useMemo(() => new MentorsApi(), []);

  const { value: data, loading } = useAsync(async () => {
    const { data = [] } = await service.getMentorDashboardData(mentorId, courseId);
    return data;
  }, [hasChanged]);

  return [data, loading] as const;
}
