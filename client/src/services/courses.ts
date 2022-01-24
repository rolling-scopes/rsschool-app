import axios from 'axios';
import { CoursesApi } from 'api';
import { Course } from './models';

type CourseResponse = { data: Course };
type CoursesResponse = { data: Course[] };

export class CoursesService {
  private coursesApi = new CoursesApi();

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
    const result = await axios.get<CoursesResponse>(`/api/courses`);
    return result.data.data;
  }

  async getCourse(id: number) {
    const result = await this.coursesApi.getCourse(id);
    return result.data;
  }
}
