import { message } from 'antd';
import { MentorsApi, MentorStudentDto } from 'api';
import { useMemo, useState, useEffect, useCallback } from 'react';
import uniqBy from 'lodash/uniqBy';

export function useMentorStudents(mentorId: number | null, courseId: number | null) {
  const service = useMemo(() => new MentorsApi(), []);

  const [students, setStudents] = useState<MentorStudentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStudents = useCallback(async () => {
    if (mentorId && courseId) {
      setLoading(true);
      try {
        const { data = [] } = await service.getMentorStudents(mentorId, courseId);
        const uniqueStudents = uniqBy(data, 'githubId');
        setStudents(uniqueStudents.filter(student => student.active));
      } catch {
        message.error('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    }
  }, [mentorId, courseId, service]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, reload: fetchStudents };
}
