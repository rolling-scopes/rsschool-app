import globalAxios, { AxiosInstance, AxiosResponse } from 'axios';

import { Cache, ICache } from './cache';
import { IBestWork, ICourse, IPostBestWork, ITask } from '../../modules/BestWork/interfaces';

export class BestWorkService {
  private axios: AxiosInstance;
  private readonly cacheWorks: ICache<number, IBestWork[]>;

  constructor() {
    this.axios = globalAxios.create({ baseURL: '/api/bestworks' });
    this.cacheWorks = new Cache<number, IBestWork[]>();
  }

  async postBestWork(data: IPostBestWork) {
    const result = await this.axios.post('/', data);
    const cachedTasks = this.cacheWorks.get(data.task);
    this.cacheWorks.set(data.task, [...cachedTasks, ...result.data.data]);
    return result.data.data;
  }

  async putBestWork(id: number, data: IPostBestWork) {
    const result = await this.axios.put(`/${id}`, data);
    this.cacheWorks.set(data.task, result.data.data);
    return result.data.data;
  }

  async deleteBestWork(w: IBestWork) {
    const result = await this.axios.delete(`/${w.id}`);
    const cachedTasks = this.cacheWorks.get(w.task);
    this.cacheWorks.set(w.task, [...cachedTasks.filter(t => t.id !== w.id)]);
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

  async getWorkListByTask(id: number): Promise<IBestWork[]> {
    const workFromCache = this.cacheWorks.get(id);
    if (workFromCache) return workFromCache;
    const works = await this.axios.get(`/task/${id}`);
    this.cacheWorks.set(id, works.data.data);
    return works.data.data;
  }
}
