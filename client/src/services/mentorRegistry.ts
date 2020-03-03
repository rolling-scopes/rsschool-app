import axios, { AxiosInstance } from 'axios';

export interface MentorRegistry {
  maxStudentsLimit: number;
  name: string;
  githubId: string;
  locationName: string;
}

export class MentorRegistryService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({ baseURL: `/api/registry` });
  }

  public async getMentors() {
    const response = await this.axios.get('/mentors');
    return response.data.data;
  }

  public async updateMentor(githubId: string, data: any) {
    const response = await this.axios.put(`/mentor/${githubId}`, data);
    return response.data.data;
  }

  public async getMentor() {
    const response = await this.axios.get(`/mentor`);
    return response.data.data;
  }
}
