import type { API, GameResult, APIRequestResult, QueryStringOptions, RequestError } from '@/common/types';
import useCurrUser from '@/stores/curr-user';
import { Endpoints } from '@/common/enums/endpoints';
import { APIService } from './api-service';
import { APIError } from './error-handling/api-error';
import { errorHandler } from './error-handling/error-handler';

const { hasAuth, getUserId } = useCurrUser();

export class GameResultService implements API<GameResult> {
  private service: APIService<GameResult>;

  constructor(gameId: string, private userId = '') {
    this.service = new APIService<GameResult>(`${Endpoints.games}/${gameId}/${Endpoints.results}`);
  }

  public getAllList() {
    return this.service.getAllList();
  }

  public getByOptions(options: QueryStringOptions) {
    return this.service.getByOptions(options);
  }

  public getAll(page = 1, limit = 10, order = '', searchText = '', filter = '', userId = this.userId) {
    return this.service.getAll(page, limit, order, searchText, filter, userId);
  }

  public getById(id: string) {
    return this.service.getById(id);
  }

  public create(gameResult: GameResult) {
    const res: APIRequestResult<GameResult> = {
      ok: false,
      status: 401,
      data: {} as GameResult,
      error: {} as RequestError,
      headers: {} as Headers,
    };
    try {
      const userId = getUserId;
      if (!(hasAuth && userId)) throw new APIError('Unauthorized', 401, res.error);

      const { count, time } = gameResult;
      const body = { userId, count, time };
      return this.service.create(body);
    } catch (error) {
      errorHandler(error);
    }
    return new Promise<APIRequestResult<GameResult>>((resolve) => {
      resolve(res);
    });
  }

  public updateById(gameId: string, gameResult: GameResult) {
    const { id, count, time } = gameResult;
    const body = { id, count, time };
    return this.service.updateById(gameId, body);
  }

  public update(gameResult: GameResult) {
    const res: APIRequestResult<GameResult> = {
      ok: false,
      status: 401,
      data: {} as GameResult,
      error: {} as RequestError,
      headers: {} as Headers,
    };
    try {
      const userId = getUserId;
      if (!(hasAuth && userId)) throw new APIError('Unauthorized', 401, res.error);

      const { count, time } = gameResult;
      const body = { userId, count, time };
      return this.service.update(body);
    } catch (error) {
      errorHandler(error);
    }
    return res;
  }

  public deleteById(id: string) {
    return this.service.deleteById(id);
  }
}

export default GameResultService;
