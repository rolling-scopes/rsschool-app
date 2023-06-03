import { checkType, IBadReview } from './../components/BadReview/BadReviewControllers';
import globalAxios, { AxiosInstance } from 'axios';
import { message } from 'antd';

type routesType = Exclude<checkType, 'No type'>;

const ROUTES: Record<routesType, string> = {
  'Bad comment': 'badcomment',
  'Did not check': 'maxscore',
};

export class CheckService {
  private axios: AxiosInstance;
  private cache: Record<number, Record<routesType, IBadReview[]>>;

  constructor() {
    this.axios = globalAxios.create({ baseURL: `/api/` });
    this.cache = {};
  }

  async getData(taskId: number, type: checkType, courseId: number) {
    let dataFromService: IBadReview[] = [];
    try {
      switch (type) {
        case 'Bad comment':
        case 'Did not check':
          dataFromService = await this.getDataFromServer(taskId, type, courseId);
          break;
        case 'No type':
          break;
        default:
          throw new Error('Unsupported type');
      }
    } catch (error) {
      message.error('Something went wrong');
    }
    return dataFromService;
  }

  private async getDataFromServer(taskId: number, type: routesType, courseId: number) {
    if (this.cache?.[taskId]?.[type]) return this.cache[taskId][type];
    const result = await this.axios.get(`checks/${ROUTES[type]}/${courseId}/${taskId}`);
    this.saveToCache(taskId, type, result.data.data);
    return result.data.data;
  }

  private saveToCache(taskId: number, type: routesType, data: IBadReview) {
    this.cache = { ...this.cache, [taskId]: { ...this.cache[taskId], [type]: data } };
  }
}
