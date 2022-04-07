import axios from 'axios';
import type { CoursesResponse } from './courses';

const baseURL = process.env.CDN_HOST || '';

export class CdnService {
  constructor(private client = axios.create({ baseURL, withCredentials: !!baseURL })) {}

  public async getCourses() {
    try {
      const result = await this.client.get<CoursesResponse>(`/api/courses`);
      return result.data.data;
    } catch (e) {
      return [];
    }
  }

  public async registerStudent(payload: any) {
    const result = await this.client.post<CoursesResponse>(`/api/registry`, payload);
    return result.data.data;
  }

  public async registerMentor(payload: any) {
    const result = await this.client.post<CoursesResponse>(`/api/registry/mentor`, payload);
    return result.data.data;
  }
}
