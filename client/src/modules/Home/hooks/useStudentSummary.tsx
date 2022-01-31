import { Session } from 'components/withSession';
import { isStudent } from 'domain/user';
import { loadHomeData } from 'modules/Home/data/loadHomeData';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { StudentSummary } from 'services/course';
import { Course } from 'services/models';

export function useStudentSummary(session: Session, course: Course | null) {
  const [studentSummary, setStudentSummary] = useState<StudentSummary | null>(null);
  const [courseTasks, setCourseTasks] = useState<{ id: number }[]>([]);

  useAsync(async () => {
    if (!course || !isStudent(session, course.id)) {
      return;
    }
    const data = await loadHomeData(course.id);
    setStudentSummary(data?.studentSummary ?? null);
    setCourseTasks(data?.courseTasks ?? []);
  }, [course]);

  return {
    studentSummary,
    courseTasks,
  };
}
