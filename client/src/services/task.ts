import axios from 'axios';

export interface Task {
  id: number;
  createdDate: string;
  updatedDate: string;
  name: string;
  descriptionUrl: string | null;
  description: string | null;
  githubPrRequired: string | null;
  verification: 'manual' | 'auto';
}

export interface Stage {
  id: number;
  createdDate: string;
  updatedDate: string;
  name: string;
}

export class TaskService {
  async getTasks() {
    const result = await axios.get<{ data: Task[] }>(`/api/tasks`);
    return result.data.data;
  }

  async updateTasks(data: any[]) {
    await axios.post(`/api/tasks`, data);
  }
}
