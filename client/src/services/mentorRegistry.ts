import axios, { AxiosInstance } from 'axios';

export interface MentorRegistry {
  maxStudentsLimit: number;
  name: string;
  githubId: string;
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
}
