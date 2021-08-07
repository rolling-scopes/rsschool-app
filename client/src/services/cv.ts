import axios, { AxiosInstance } from 'axios';
import { getServerAxiosProps } from 'utils/axios';
import { NextPageContext } from 'next';
import { JobSeekerData, GetFullCVData, AllUserCVData, EditCVData } from '../../../common/models/cv';

export class CVService {
  private axios: AxiosInstance;

  constructor(ctx?: NextPageContext) {
    this.axios = axios.create(getServerAxiosProps(ctx));
  }

  private static baseRoute = '/api/opportunities';

  async getOpportunitiesConsent(githubId: string) {
    const response = await this.axios.get<{ data: boolean }>(`${CVService.baseRoute}/consent/`, {
      params: { githubId },
    });
    return response.data.data;
  }

  async changeOpportunitiesConsent(githubId: string, opportunitiesConsent: boolean) {
    const response = await this.axios.post<{ data: boolean }>(`${CVService.baseRoute}/consent/`, {
      githubId,
      opportunitiesConsent,
    });
    return response.data.data;
  }

  async getAllJobSeekersData() {
    const response = await this.axios.get<{ data: JobSeekerData[] }>(`${CVService.baseRoute}/jobseekers`);
    return response.data.data;
  }

  async getVisibleJobSeekersData() {
    const response = await this.axios.get<{ data: JobSeekerData[] }>(`${CVService.baseRoute}/jobseekers?mod=visible`);
    return response.data.data;
  }

  async createEmptyCV() {
    const response = await this.axios.put<{ data: any }>(`${CVService.baseRoute}/cv`);
    return response.data.data;
  }

  async getEditCVData(githubId: string) {
    const response = await this.axios.get<{ data: EditCVData }>(`${CVService.baseRoute}/cv-edit`, {
      params: { githubId },
    });
    return response.data.data;
  }

  async getFullCVData(githubId: string) {
    const response = await this.axios.get<{ data: GetFullCVData }>(`${CVService.baseRoute}/cv-view`, {
      params: { githubId },
    });
    return response.data.data;
  }

  async saveCVData(opportunitiesInfo: AllUserCVData) {
    const response = await this.axios.post<{ data: AllUserCVData }>(`${CVService.baseRoute}`, opportunitiesInfo);
    return response.data.data;
  }

  async extendCV() {
    const response = await this.axios.post<{ data: number }>(`${CVService.baseRoute}/extend`);
    return response.data.data;
  }

  async changeCVVisibility(githubId: string, isHidden: boolean) {
    const response = await this.axios.post<{ data: boolean }>(`${CVService.baseRoute}/visibility/`, {
      githubId,
      isHidden,
    });
    return response.data.data;
  }
}
