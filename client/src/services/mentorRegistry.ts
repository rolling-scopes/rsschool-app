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
  updatedDate: Date;
}

export interface FilterMentorRegistriesDto {
  currentPage: number;
  pageSize: number;
  githubId?: string;
  cityName?: string;
  preferedCourses?: number[];
  preselectedCourses?: number[];
  technicalMentoring?: string[];
}

export interface FilterMentorRegistriesResponse {
  content: FilterMentorRegistriesDto[];
  total: number;
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

  public async cancelMentorRegistry(githubId: string) {
    await this.registryApi.cancelMentorRegistry(githubId);
  }

  public async sendCommentMentorRegistry(githubId: string, comment: string) {
    await this.registryApi.commentMentorRegistry(githubId, { comment: comment });
  }

  public async getMentor() {
    const response = await this.axios.get<AxiosResponse<MentorResponse>>(`/mentor`);
    return response.data.data;
  }

  public async filterMentorRegistries({
    currentPage,
    pageSize,
    githubId,
    cityName,
    preferedCourses,
    preselectedCourses,
    technicalMentoring,
  }: FilterMentorRegistriesDto) {
    const resp = await this.registryApi.filterMentorRegistries(
      pageSize,
      currentPage,
      githubId,
      cityName,
      preferedCourses,
      preselectedCourses,
      technicalMentoring,
    );
    return { content: resp.data.content, total: resp.data.total };
  }
}
