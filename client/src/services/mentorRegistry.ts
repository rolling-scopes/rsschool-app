import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PreferredStudentsLocation } from 'common/enums/mentor';

export type MentorResponse = {
  preselectedCourses: number[];
  maxStudentsLimit: number;
  preferedStudentsLocation: PreferredStudentsLocation;
};

export interface MentorRegistry {
  maxStudentsLimit: number;
  name: string;
  githubId: string;
  cityName: string;
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
    const response = await this.axios.put(`/mentor/${githubId}`, data, {
      baseURL: `/api/v2/registry`,
    });
    return response.data.data;
  }

  public async cancelMentor(githubId: string) {
    const response = await this.axios.delete(`/mentor/${githubId}`);
    return response.data.data;
  }

  public async getMentor() {
    const response = await this.axios.get<AxiosResponse<MentorResponse>>(`/mentor`);
    return response.data.data;
  }
}
