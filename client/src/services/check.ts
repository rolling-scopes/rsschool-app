import { checkType, IBadReview } from './../components/BadReview/BadReviewControllers';
import globalAxios, { AxiosInstance } from 'axios';

export class CheckService {
  private axios: AxiosInstance;
  private cache: Record<number, Record<checkType, IBadReview[]>>;

  constructor() {
    this.axios = globalAxios.create({ baseURL: `/api/` });
    this.cache = {};
  }

  async getBadComments(taskId: number, type: checkType): Promise<IBadReview[]> {
    if (this.cache?.[taskId]?.[type]) return this.cache[taskId][type];
    const result = await this.axios.get(`checks/badcomment/${taskId}`);
    this.cache = { ...this.cache, [taskId]: { ...this.cache[taskId], [type]: result.data.data } };
    return result.data.data;
  }

  async getMaxScoreCheckers(taskId: number, type: checkType): Promise<IBadReview[]> {
    if (this.cache?.[taskId]?.[type]) return this.cache[taskId][type];
    const result = await this.axios.get(`checks/maxscore/${taskId}`);
    this.cache = { ...this.cache, [taskId]: { ...this.cache[taskId], [type]: result.data.data } };
    return result.data.data;
  }
}
