import axios, { AxiosInstance } from 'axios';
import { sortTasksByEndDate } from 'services/rules';

export interface CourseTask {
  id: number;
  courseTaskId?: number;
  taskId: number;
  name: string;
  maxScore: number | null;
  verification: 'auto' | 'manual';
  type: 'jstask' | 'htmltask' | 'htmlcssacademy' | 'codewars' | 'test';
  githubRepoName: string;
  sourceGithubRepoUrl: string;
  scoreWeight: number;
  stageId: number;
  githubPrRequired: boolean;
  description: string | null;
  descriptionUrl: string | null;
  studentStartDate: string | null;
  studentEndDate: string | null;
  taskResultCount: number;
  useJury: boolean;
  checker: 'mentor' | 'assigned' | 'taskOwner' | 'crossCheck' | 'jury';
  taskOwner: { id: number; githubId: string; name: string } | null;
}

export class CourseTaskService {
  private axios: AxiosInstance;

  constructor(private courseId: number) {
    this.axios = axios.create({ baseURL: `/api/course/${this.courseId}` });
  }

  public async getCourseTasks() {
    type Response = { data: CourseTask[] };
    const result = await this.axios.get<Response>('/tasks');
    return result.data.data.sort(sortTasksByEndDate);
  }

  public async getCourseTasksForTaskOwner() {
    const result = await this.axios.get<{ data: CourseTask[] }>(`/tasksTaskOwner`);
    return result.data.data;
  }
}
