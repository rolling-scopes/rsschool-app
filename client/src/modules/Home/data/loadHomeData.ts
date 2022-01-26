import { Session } from 'components/withSession';
import { CourseService } from 'services/course';
import { isStudent } from 'domain/user';
import { CoursesTasksApi } from 'api';

export async function loadHomeData(courseId: number, session: Session) {
  if (!isStudent(session, courseId)) {
    return null;
  }
  const [studentSummary, { data: courseTasks }] = await Promise.all([
    new CourseService(courseId).getStudentSummary('me'),
    new CoursesTasksApi().getCourseTasks(courseId),
  ]);
  return {
    studentSummary,
    courseTasks: courseTasks.map(t => ({ id: t.id })),
  };
}
