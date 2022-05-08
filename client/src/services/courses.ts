import axios, { AxiosInstance } from 'axios';
import { CoursesApi, CourseDto as Course } from 'api';
import { getServerAxiosProps } from 'utils/axios';

type CourseResponse = { data: Course };
export type CoursesResponse = { data: Course[] };

export class CoursesService {
  private coursesApi = new CoursesApi();
  private axios: AxiosInstance;

  constructor(token?: string) {
    this.axios = axios.create(getServerAxiosProps(token));
  }

  async updateCourse(id: number, data: Partial<Course>) {
    const result = await axios.put<CourseResponse>(`/api/course/${id}`, data);
    return result.data.data;
  }

  async createCourse(data: Partial<Course>) {
    const result = await axios.post<CourseResponse>(`/api/course/`, data);
    return result.data.data;
  }

  async createCourseCopy(data: Partial<Course>, id: number) {
    const result = await axios.post<CourseResponse>(`/api/course/${id}/copy`, data);
    return result.data.data;
  }

  async getCourses() {
    const result = await this.axios.get<CoursesResponse>(`/api/courses`);
    return result.data.data;
  }

  async getCourse(id: number) {
    const result = await this.coursesApi.getCourse(id);
    return result.data;
  }
}
