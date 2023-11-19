import { CourseDto as Course, CoursesApi, CreateCourseDto } from 'api';
import axios from 'axios';
import { getApiConfiguration } from 'utils/axios';

type CourseResponse = { data: Course };
export type CoursesResponse = { data: Course[] };

export class CoursesService {
  private coursesApi: CoursesApi;

  constructor(private token?: string) {
    this.coursesApi = new CoursesApi(getApiConfiguration(this.token));
  }

  async createCourse(data: Partial<Course>) {
    const result = await axios.post<CourseResponse>(`/api/course/`, data);
    return result.data.data;
  }

  async createCourseCopy(data: CreateCourseDto, id: number): Promise<Course> {
    const result = await this.coursesApi.copyCourse(id, data);
    return result.data;
  }

  async getCourses() {
    const result = await this.coursesApi.getCourses();
    return result.data;
  }

  async getCourse(id: number) {
    const result = await this.coursesApi.getCourse(id);
    return result.data;
  }
}
