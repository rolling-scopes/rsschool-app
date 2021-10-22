import axios, { AxiosInstance } from 'axios';
import { getServerAxiosProps } from 'utils/axios';
import { NextPageContext } from 'next';
import { JobSeekerData, GetFullCVData, AllUserCVData, EditCVData } from 'common/models/cv';

export class OpportunitiesService {
  private axios: AxiosInstance;

  constructor(ctx?: NextPageContext) {
    this.axios = axios.create(getServerAxiosProps(ctx, '/api/opportunities'));
  }

  public async getConsent(githubId: string) {
    const response = await this.axios.get<{ data: boolean }>(`/consent/${githubId}`);
    return response.data.data;
  }

  public async updateConsent(githubId: string, consent: boolean) {
    const response = await this.axios.post<{ data: boolean }>(`/consent`, {
      githubId,
      consent,
    });
    return response.data.data;
  }

  public async getApplicants() {
    const response = await this.axios.get<{ data: JobSeekerData[] }>(`/applicants`);
    return response.data.data;
  }

  public async getEditResumeData(githubId: string) {
    const response = await this.axios.get<{ data: EditCVData }>(`/resume`, {
      params: { githubId },
    });
    return response.data.data;
  }

  public async getFullResumeData(githubId: string) {
    const response = await this.axios.get<{ data: GetFullCVData }>(`/resume?mod=all`, {
      params: { githubId },
    });
    return response.data.data;
  }

  public async saveResumeData(opportunitiesInfo: AllUserCVData) {
    const response = await this.axios.post<{ data: AllUserCVData }>(`/resume`, opportunitiesInfo);
    return response.data.data;
  }

  public async updateResume() {
    const response = await this.axios.post<{ data: number }>(`/status`);
    return response.data.data;
  }

  public async changeResumeVisibility(githubId: string, isHidden: boolean) {
    const response = await this.axios.post<{ data: boolean }>(`/visibility`, {
      githubId,
      isHidden,
    });
    return response.data.data;
  }
}
