import axios from 'axios';

export type TaskType =
  | 'jstask'
  | 'kotlintask'
  | 'objctask'
  | 'htmltask'
  | 'ipynb'
  | 'cv:markdown'
  | 'cv:html'
  | 'selfeducation'
  | 'codewars'
  | 'test'
  | 'interview'
  | 'stage-interview'
  | 'codejam';

export interface Task {
  id: number;
  createdDate: string;
  updatedDate: string;
  name: string;
  descriptionUrl: string | null;
  description: string | null;
  githubPrRequired: boolean | null;
  verification: 'manual' | 'auto';
  type: TaskType;
  githubRepoName: string;
  sourceGithubRepoUrl: string;
  tags: string[];
  discipline: string;
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

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const result = await axios.put<{ data: Task }>(`/api/task/${id}`, data);
    return result.data.data;
  }

  async createTask(data: Partial<Task>): Promise<Task> {
    const result = await axios.post<{ data: Task }>(`/api/task/`, data);
    return result.data.data;
  }
}
