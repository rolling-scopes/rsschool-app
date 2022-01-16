import { Session } from 'components/withSession';
import { CourseService } from 'services/course';
import { isStudent } from 'domain/user';

export async function loadHomeData(courseId: number, session: Session) {
  if (!isStudent(session, courseId)) {
    return null;
  }
  const courseService = new CourseService(courseId);
  const [studentSummary, courseTasks] = await Promise.all([
    courseService.getStudentSummary('me'),
    courseService.getCourseTasks(),
  ]);
  return {
    studentSummary,
    courseTasks: courseTasks.map(t => ({ id: t.id })),
  };
}
