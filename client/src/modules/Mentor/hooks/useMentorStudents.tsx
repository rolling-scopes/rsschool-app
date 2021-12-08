import {
  MentorsApi,
  MentorStudentDto
} from 'api';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';

export function useMentorStudents(mentorId: number) {
  const [students, setStudents] = useState<MentorStudentDto[]>([]);
  const service = useMemo(() => new MentorsApi(undefined, ''), []);
  const [loading, setLoading] = useState(false);

  useAsync(async () => {
    try {
      setLoading(true);
      const { data } = await service.getMentorStudents(mentorId);
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  return [students, loading] as const;
}
