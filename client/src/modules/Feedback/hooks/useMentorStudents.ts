import { useEffect, useMemo, useState } from 'react';
import { CourseService } from 'services/course';
import { StudentBasic } from 'services/models';

export function useMentorStudents(courseId: number) {
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [data, setStudents] = useState([] as StudentBasic[]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    service
      .getMentorStudents()
      .then(students => {
        setStudents(students);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [service]);
  return [data, error, loading] as const;
}
