import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RegistryApi } from 'api';
import { PreferredStudentsLocation } from 'common/enums/mentor';

export type MentorResponse = {
  preselectedCourses: number[];
  maxStudentsLimit: number;
  preferedStudentsLocation: PreferredStudentsLocation;
  preferredCourses: number[];
};

export interface MentorRegistry {
  maxStudentsLimit: number;
  name: string;
  githubId: string;
  cityName: string;
}

export class MentorRegistryService {
  private axios: AxiosInstance;
  private registryApi: RegistryApi;

  constructor() {
    this.axios = axios.create({ baseURL: `/api/registry` });
    this.registryApi = new RegistryApi();
  }

  public async getMentors() {
    const response = await this.registryApi.getMentorRegistries();
    return response.data;
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
