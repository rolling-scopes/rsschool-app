import axios, { AxiosInstance } from 'axios';
import { getServerAxiosProps } from 'utils/axios';
import { NextPageContext } from 'next';
import { JobSeekerData, GetCVData, SaveCVData } from '../../../common/models/cv';

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
    const response = await this.axios.get<{ data: JobSeekerData[] }>(`${CVService.baseRoute}`);
    return response.data.data;
  }

  async createEmptyCV() {
    const response = await this.axios.put<{ data: any }>(`${CVService.baseRoute}/cv`);
    return response.data.data;
  }

  async getCVData(githubId: string) {
    const response = await this.axios.get<{ data: GetCVData }>(`${CVService.baseRoute}/cv`, {
      params: { githubId },
    });
    return response.data.data;
  }

  async saveCVData(opportunitiesInfo: SaveCVData) {
    const response = await this.axios.post<{ data: SaveCVData }>(`${CVService.baseRoute}`, opportunitiesInfo);
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
