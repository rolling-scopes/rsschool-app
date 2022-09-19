import type {
  API,
  Suggestion,
  SuggestionsRating,
  APIRequestResult,
  QueryStringOptions,
  RequestError,
} from '@/common/types';
import useCurrUser from '@/stores/curr-user';
import { Endpoints } from '@/common/enums/endpoints';
import { APIService } from './api-service';
import { APIError } from './error-handling/api-error';
import { errorHandler } from './error-handling/error-handler';

const { hasAuth, getUserId } = useCurrUser();

export class SuggestionsService implements API<Suggestion> {
  private service = new APIService<Suggestion>(Endpoints.suggestions);

  public getAllList() {
    return this.service.getAllList();
  }

  public getByOptions(options: QueryStringOptions) {
    return this.service.getByOptions(options);
  }

  public getAll(page = 1, limit = 10, order = '', searchText = '', filter = '', userId = '') {
    return this.service.getAll(page, limit, order, searchText, filter, userId);
  }

  public getById(id: string) {
    return this.service.getById(id);
  }

  public create(body: Suggestion) {
    return this.service.create(body);
  }

  public createImage(suggestion: Suggestion, file: File) {
    const formData = new FormData();
    formData.append('description', suggestion.description);
    formData.append('userId', suggestion.userId);
    formData.append('file', file);

    return this.service.createImage(formData);
  }

  public updateById(suggestionId: string, suggestion: Suggestion) {
    const { id, status } = suggestion;
    const body = { id, status };
    return this.service.updateById(suggestionId, body);
  }

  public static updateRatingById(suggestionId: string, rate: number) {
    const res: APIRequestResult<SuggestionsRating> = {
      ok: false,
      status: 401,
      data: {} as SuggestionsRating,
      error: {} as RequestError,
      headers: {} as Headers,
    };
    try {
      const ratingService = new APIService<SuggestionsRating>(`${Endpoints.suggestions}/${suggestionId}/rating`);
      const userId = getUserId;

      if (!(hasAuth && userId)) throw new APIError('Unauthorized', 401, res.error);

      const body: SuggestionsRating = { suggestionId, userId, rate };
      return ratingService.update(body);
    } catch (error) {
      errorHandler(error);
    }
    return res;
  }

  public deleteById(id: string) {
    return this.service.deleteById(id);
  }
}

export default SuggestionsService;
