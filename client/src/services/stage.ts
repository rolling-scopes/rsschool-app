import axios from 'axios';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export interface Stage {
  id: number;
  name: string;
  courseId: number;
  startDate: string | null;
  endDate: string | null;
}

export class StageService {
  private host = serverRuntimeConfig.rsHost || '';

  async getStages() {
    const result = await axios.get<{ data: Stage[] }>(`${this.host}/api/stages`);
    return result.data.data.sort((a, b) => b.id - a.id);
  }

  async createStage(data: Partial<Stage>) {
    const result = await axios.post<{ data: Stage }>(`${this.host}/api/stage/`, data);
    return result.data.data;
  }

  async updateStage(id: number, data: Partial<Stage>) {
    const result = await axios.put<{ data: Stage }>(`${this.host}/api/stage/${id}`, data);
    return result.data.data;
  }
}
