import { StudentSummaryDto } from 'api';
import { Session } from 'components/withSession';
import { isStudent } from 'domain/user';
import { loadHomeData } from 'modules/Home/data/loadHomeData';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { Course } from 'services/models';

export function useStudentSummary(session: Session, course: Course | null) {
  const [studentSummary, setStudentSummary] = useState<StudentSummaryDto | null>(null);
  const [courseTasks, setCourseTasks] = useState<{ id: number }[]>([]);

  useAsync(async () => {
    const showData = course && isStudent(session, course.id);
    const data = showData ? await loadHomeData(course.id, session.githubId) : null;
    setStudentSummary(data?.studentSummary ?? null);
    setCourseTasks(data?.courseTasks ?? []);
  }, [course]);

  return {
    studentSummary,
    courseTasks,
  };
}
