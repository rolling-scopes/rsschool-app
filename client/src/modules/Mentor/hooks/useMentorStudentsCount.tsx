import { MentorsApi } from 'api';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

export function useMentorStudentsCount(mentorId: number | null, courseId: number) {
  const service = useMemo(() => new MentorsApi(), []);

  const { value: data, loading } = useAsync(async () => {
    const { data = [] } = mentorId ? await service.getCourseStudentsCount(mentorId, courseId) : { data: [] };
    return data;
  }, []);

  return [data, loading] as const;
}
