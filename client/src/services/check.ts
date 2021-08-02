import { IBadReview } from './../components/BadReview/BadReviewControllers';
import globalAxios, { AxiosInstance } from 'axios';

export class CheckService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = globalAxios.create({ baseURL: `/api/` });
  }

  async getBadComments(taskId: number): Promise<IBadReview[]> {
    const result = await this.axios.get(`checks/badcomment/${taskId}`);
    return result.data.data;
  }

  async getMaxScoreCheckers(taskId: number): Promise<IBadReview[]> {
    const result = await this.axios.get(`checks/maxscore/${taskId}`);
    return result.data.data;
  }
}
