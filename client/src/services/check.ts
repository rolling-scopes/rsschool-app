import { message } from 'antd';
import { CoursesTasksApi } from '@client/api';
import { IBadReview, checkType } from '@client/modules/CrossCheckPairs/components/BadReview/BadReviewControllers';

type routesType = Exclude<checkType, 'No type'>;

const coursesTasksApi = new CoursesTasksApi();

export class CheckService {
  private cache: Record<number, Record<routesType, IBadReview[]>>;

  constructor() {
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
    } catch {
      message.error('Something went wrong');
    }
    return dataFromService;
  }

  private async getDataFromServer(taskId: number, type: routesType, courseId: number) {
    if (this.cache?.[taskId]?.[type]) return this.cache[taskId][type];
    const { data } =
      type === 'Bad comment'
        ? await coursesTasksApi.getBadCommentCheckers(courseId, taskId)
        : await coursesTasksApi.getMaxScoreCheckers(courseId, taskId);
    this.saveToCache(taskId, type, data);
    return data;
  }

  private saveToCache(taskId: number, type: routesType, data: IBadReview[]) {
    if (!this.cache[taskId]) {
      this.cache[taskId] = {} as Record<routesType, IBadReview[]>;
    }
    this.cache[taskId][type] = data;
  }
}
