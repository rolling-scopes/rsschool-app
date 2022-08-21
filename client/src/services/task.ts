import axios from 'axios';
import { CourseTaskDtoTypeEnum } from 'api';
import { DisciplineDto } from 'api';

export type TaskType = CourseTaskDtoTypeEnum;

export interface Task {
  id: number;
  createdDate: string;
  updatedDate: string;
  name: string;
  descriptionUrl: string | null;
  description: string | null;
  githubPrRequired: boolean | null;
  type: TaskType;
  githubRepoName: string;
  sourceGithubRepoUrl: string;
  tags: string[];
  skills: string[];
  discipline: DisciplineDto;
  disciplineId: number;
  attributes: Record<string, any>;
}

export class TaskService {
  async getTasks() {
    const result = await axios.get<{ data: Task[] }>(`/api/tasks`);
    return result.data.data;
  }

  async getTask(id: string) {
    const result = await axios.get<{ data: Task }>(`/api/task/${id}`);
    return result.data.data;
  }

  async updateTask(id: number, data: Partial<Task>) {
    const result = await axios.put<{ data: Task }>(`/api/task/${id}`, data);
    return result.data.data;
  }

  async createTask(data: Partial<Task>) {
    const result = await axios.post<{ data: Task }>(`/api/task/`, data);
    return result.data.data;
  }
}
