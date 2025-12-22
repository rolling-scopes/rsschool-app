import { CoursesTasksApi } from '@client/api';
import { CourseService } from 'services/course';

export async function loadHomeData(courseId: number, githubId: string) {
  const [studentSummary, { data: courseTasks }] = await Promise.all([
    new CourseService(courseId).getStudentSummary(githubId),
    new CoursesTasksApi().getCourseTasks(courseId),
  ]);
  return {
    studentSummary,
    courseTasks: courseTasks.map(t => ({ id: t.id })),
  };
}
