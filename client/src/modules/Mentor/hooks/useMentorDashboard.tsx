import { useRequest } from 'ahooks';
import { MentorsApi } from 'api';

const service = new MentorsApi();

export function useMentorDashboard(mentorId: number | undefined, courseId: number) {
  const { data, loading, run } = useRequest(async () => {
    if (!mentorId) {
      return [];
    }
    const { data = [] } = await service.getMentorDashboardData(mentorId, courseId);
    return data;
  });
  return [data, loading, run] as const;
}
