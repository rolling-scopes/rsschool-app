import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PreferredStudentsLocation } from 'common/enums/mentor';
import { featureToggles } from './features';

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
    const response = await this.axios.get<any>('/mentors');
    return response.data.data;
  }

  public async updateMentor(githubId: string, data: any) {
    const response = await this.axios.put<any>(`/mentor/${githubId}`, data, {
      baseURL: featureToggles.notifications ? `/api/v2/registry` : undefined,
    });
    return response.data.data;
  }

  public async cancelMentor(githubId: string) {
    const response = await this.axios.delete<any>(`/mentor/${githubId}`);
    return response.data.data;
  }

  public async getMentor() {
    const response = await this.axios.get<AxiosResponse<MentorResponse>>(`/mentor`);
    return response.data.data;
  }
}
