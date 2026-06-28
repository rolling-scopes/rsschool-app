import { message } from 'antd';
import { MentorsApi, MentorStudentDto } from '@client/api';
import { useMemo, useState, useEffect, useCallback } from 'react';

export function useMentorStudents(mentorId: number | null) {
  const service = useMemo(() => new MentorsApi(), []);

  const [students, setStudents] = useState<MentorStudentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStudents = useCallback(async () => {
    if (mentorId) {
      setLoading(true);
      try {
        const { data = [] } = await service.getMentorStudents(mentorId);
        setStudents(data);
      } catch {
        message.error('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    }
  }, [mentorId, service]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, reload: fetchStudents };
}
