import { MentorsApi } from 'api';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

export function useMentorStudents(mentorId: number) {
  const service = useMemo(() => new MentorsApi(), []);

  const { value: students, loading } = useAsync(async () => {
    const { data } = await service.getMentorStudents(mentorId);
    return data;
  }, []);

  return [students, loading] as const;
}
