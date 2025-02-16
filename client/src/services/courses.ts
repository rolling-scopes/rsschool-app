import { CourseDto as Course, CoursesApi, CreateCourseDto } from 'api';

export type CoursesResponse = { data: Course[] };

export class CoursesService {
  private coursesApi: CoursesApi;

  constructor() {
    this.coursesApi = new CoursesApi();
  }

  async createCourse(data: CreateCourseDto) {
    const result = await this.coursesApi.createCourse(data);
    return result.data;
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
