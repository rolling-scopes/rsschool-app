import { MentorsApi } from 'api';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

export function useMentorStudents(mentorId: number | undefined) {
  const service = useMemo(() => new MentorsApi(), []);

  const { value: students, loading } = useAsync(async () => {
    const { data = [] } = mentorId ? await service.getMentorStudents(mentorId) : { data: [] };
    return data;
  }, []);

  return [students, loading] as const;
}
