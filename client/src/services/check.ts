import { CoursesTasksApi } from 'api';

const courseTaskService = new CoursesTasksApi();

export class CheckService {
  async getData(courseTaskId: number, type: 'badcomment' | 'didnotcheck' | undefined, courseId: number) {
    switch (type) {
      case 'badcomment': {
        const response = await courseTaskService.getCourseTaskBadComments(courseId, courseTaskId);
        return response.data;
      }
      case 'didnotcheck': {
        const response = await courseTaskService.getCourseTaskMaxScoreCheckers(courseId, courseTaskId);
        return response.data;
      }
      default:
        return [];
    }
  }
}
