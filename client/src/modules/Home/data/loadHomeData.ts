import { Session } from 'components/withSession';
import { CourseService } from 'services/course';
import { isStudent } from 'domain/user';
import { CoursesTasksApi } from 'api';
import { useMemo } from 'react';

export async function loadHomeData(courseId: number, session: Session) {
  if (!isStudent(session, courseId)) {
    return null;
  }
  const courseService = new CourseService(courseId);
  const courseTasksApi = useMemo(() => new CoursesTasksApi(), []);
  const [studentSummary, courseTasks] = await Promise.all([
    courseService.getStudentSummary('me'),
    (await courseTasksApi.getCourseTasks(courseId)).data,
  ]);
  return {
    studentSummary,
    courseTasks: courseTasks.map(t => ({ id: t.id })),
  };
}
