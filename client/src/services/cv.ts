import axios, { AxiosInstance } from 'axios';
import { getServerAxiosProps } from 'utils/axios';
import { NextPageContext } from 'next';

/* export interface Stage {
  id: number;
  name: string;
  courseId: number;
  startDate: string | null;
  endDate: string | null;
} */

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

  async getJobSeekersData() {
    const response = await this.axios.get<{ data: any }>(`${CVService.baseRoute}`);
    return response.data.data;
  }

  async createEmptyCV() {
    const response = await this.axios.put<{ data: any }>(`${CVService.baseRoute}/cv`);
    return response.data.data;
  }

  async getCVData(githubId: string) {
    const response = await this.axios.get<{ data: any }>(`${CVService.baseRoute}/cv`, {
      params: { githubId },
    });
    return response.data.data;
  }

  async saveCVData(opportunitiesInfo: any) {
    const response = await this.axios.post<{ data: any }>(`${CVService.baseRoute}`, opportunitiesInfo);
    return response.data.data;
  }

  async extendCV() {
    const response = await this.axios.post<{ data: number }>(`${CVService.baseRoute}/extend`);
    return response.data.data;
  }

  async checkCVExistance(githubId: string) {
    const response = await this.axios.get<{ data: boolean }>(`${CVService.baseRoute}/exists`, {
      params: { githubId },
    });
    return response.data.data;
  }
}
