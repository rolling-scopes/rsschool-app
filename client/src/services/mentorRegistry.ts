import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { MentorRegistryDto, RegistryApi, InviteMentorsDto } from 'api';
import { PreferredStudentsLocation } from '@common/enums/mentor';
import { MentorRegistryTabsMode } from 'modules/MentorRegistry/constants';

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

export interface GetMentorRegistriesDto {
  status: MentorRegistryTabsMode;
  currentPage: number;
  pageSize: number;
  githubId?: string;
  cityName?: string;
  preferedCourses?: number[];
  preselectedCourses?: number[];
  technicalMentoring?: string[];
}

export interface GetMentorRegistriesResponse {
  mentors: MentorRegistryDto[];
  total: number;
}

export interface GetMentorRegistriesOptions {
  currentPage?: number;
  pageSize?: number;
  githubId?: string;
  cityName?: string;
  preferedCourses?: number[];
  preselectedCourses?: number[];
  technicalMentoring?: string[];
}

export class MentorRegistryService {
  private axios: AxiosInstance;
  private registryApi: RegistryApi;

  constructor() {
    this.axios = axios.create({ baseURL: `/api/registry` });
    this.registryApi = new RegistryApi();
  }

  public async getMentors(options?: GetMentorRegistriesDto): Promise<GetMentorRegistriesResponse> {
    if (!options) {
      const response = await this.registryApi.getMentorRegistries();
      return response.data;
    } else {
      const response = await this.registryApi.getMentorRegistries(
        options.status,
        options.pageSize,
        options.currentPage,
        options.githubId,
        options.cityName,
        options.preferedCourses,
        options.preselectedCourses,
        options.technicalMentoring,
      );
      return response.data;
    }
  }

  public async updateMentor(githubId: string, data: { preselectedCourses: string[] }) {
    await this.registryApi.approveMentor(githubId, {
      preselectedCourses: data.preselectedCourses,
    });
  }

  public async cancelMentorRegistry(githubId: string) {
    await this.registryApi.cancelMentorRegistry(githubId);
  }

  public async sendCommentMentorRegistry(githubId: string, comment: string) {
    await this.registryApi.commentMentorRegistry(githubId, { comment: comment });
  }

  public async getMentor() {
    try {
      const response = await this.axios.get<AxiosResponse<MentorResponse>>(`/mentor`);
      return response.data.data;
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 404) {
        console.info('Mentor is not found in the mentor registry.');
        return null;
      }
      throw e;
    }
  }

  public async inviteMentors(data: InviteMentorsDto) {
    await this.registryApi.inviteMentors(data);
  }
}
