import axios from 'axios';
import { CoursesApi } from 'api';
import type { CoursesResponse } from './courses';

const baseURL = process.env.CDN_HOST || '';

const coursesService = new CoursesApi();

export class CdnService {
  constructor(private client = axios.create({ baseURL, withCredentials: !!baseURL })) {}

  public async getCourses() {
    try {
      const result = await coursesService.getCourses();
      return result.data;
    } catch {
      return [];
    }
  }

  public async registerStudent(payload: unknown) {
    const result = await this.client.post<CoursesResponse>(`/api/registry`, payload);
    return result.data.data;
  }

  public async registerMentor(payload: unknown) {
    const result = await this.client.post<CoursesResponse>(`/api/registry/mentor`, payload);
    return result.data.data;
  }
}
