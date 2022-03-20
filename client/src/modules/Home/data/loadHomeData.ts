import { CoursesTasksApi } from 'api';
import { CourseService } from 'services/course';

export async function loadHomeData(courseId: number) {
  const [studentSummary, { data: courseTasks }] = await Promise.all([
    new CourseService(courseId).getStudentSummary('me'),
    new CoursesTasksApi().getCourseTasks(courseId),
  ]);
  return {
    studentSummary,
    courseTasks: courseTasks.map(t => ({ id: t.id })),
  };
}
