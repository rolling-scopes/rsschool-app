import globalAxios, { AxiosInstance } from 'axios';
import { IForm } from '../components/BestWorks/AddBestWork';

interface IPostBestWork extends IForm {
  course: number;
}

export class BestWorkService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = globalAxios.create({ baseURL: '/api/bestworks' });
  }

  async postBestWork(data: IPostBestWork) {
    console.log(data);
    const result = this.axios.post<Response>('/', data);
    return result;
  }
}
