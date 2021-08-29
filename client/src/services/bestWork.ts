import globalAxios, { AxiosInstance, AxiosResponse } from 'axios';

export interface IForm {
  users: number[];
  task: number;
  projectUrl: string;
  imageUrl: string;
  tags: string[];
}

export interface IPostBestWork extends IForm {
  id?: number;
  course: number;
}

export interface ICourse {
  courseId: number;
  courseName: string;
}

export interface ITask {
  taskId: number;
  taskName: string;
}

export class BestWorkService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = globalAxios.create({ baseURL: '/api/bestworks' });
  }

  async postBestWork(data: IPostBestWork) {
    const result = await this.axios.post('/', data);
    return result.data.data;
  }

  async putBestWork(id: number, data: IPostBestWork) {
    console.log(data, id);
    const result = await this.axios.put(`/${id}`, data);
    console.log(result.data.data);
    return result.data.data;
  }

  async deleteBestWork(id: number) {
    const result = await this.axios.delete(`/${id}`);
    return result.data.data;
  }

  async getCourseList(): Promise<ICourse[]> {
    const courses = await this.axios.get<AxiosResponse<ICourse[]>>('/course/');
    return courses.data.data;
  }

  async getTaskList(id: number): Promise<ITask[]> {
    const tasks = await this.axios.get<AxiosResponse<ITask[]>>(`/course/${id}`);
    return tasks.data.data;
  }

  async getWorkListByTask(id: number) {
    const works = await this.axios.get(`/task/${id}`);
    return works.data.data;
  }
}
