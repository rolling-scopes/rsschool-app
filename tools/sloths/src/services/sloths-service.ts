import type {
  API,
  APIRequestResult,
  QueryStringOptions,
  RequestError,
  Sloth,
  SlothRating,
  SlothTags,
  Tag,
} from '@/common/types';
import { Endpoints } from '@/common/enums/endpoints';
import useCurrUser from '@/stores/curr-user';
import { APIService } from './api-service';
import { APIError } from './error-handling/api-error';
import { errorHandler } from './error-handling/error-handler';

const { hasAuth, getUserId } = useCurrUser();

export class SlothsService implements API<Sloth> {
  private service = new APIService<Sloth>(Endpoints.sloths);

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

  public create(body: Sloth) {
    return this.service.create(body);
  }

  public createImage(sloth: Sloth, file: File) {
    const formData = new FormData();
    formData.append('caption', sloth.caption);
    formData.append('description', sloth.description);

    if (sloth.tags) formData.append('tags', JSON.stringify(sloth.tags));

    formData.append('file', file);

    return this.service.createImage(formData);
  }

  public updateById(slothId: string, sloth: Sloth) {
    const { id, caption, description } = sloth;
    const imageUrl = sloth.image_url;
    const body = { id, caption, description, image_url: imageUrl };
    return this.service.updateById(slothId, body);
  }

  public static updateByIdAndTags(slothId: string, sloth: Sloth) {
    const tagsService = new APIService<SlothTags>(Endpoints.sloths);

    const { id, caption, description, tags } = sloth;
    const imageUrl = sloth.image_url;
    const body = { id, caption, description, image_url: imageUrl, tags: JSON.stringify(tags) };
    return tagsService.updateById(slothId, body);
  }

  public static updateByIdAndTagsImage(slothId: string, sloth: Sloth, file: File) {
    const tagsService = new APIService<SlothTags>(Endpoints.sloths);

    const formData = new FormData();
    formData.append('id', sloth.id);
    formData.append('caption', sloth.caption);
    formData.append('description', sloth.description);
    formData.append('image_url', sloth.image_url);

    if (sloth.tags) formData.append('tags', JSON.stringify(sloth.tags));

    formData.append('file', file);
    return tagsService.updateByIdAndImage(slothId, formData);
  }

  public static updateRatingById(slothId: string, rate: number) {
    const res: APIRequestResult<SlothRating> = {
      ok: false,
      status: 401,
      data: {} as SlothRating,
      error: {} as RequestError,
      headers: {} as Headers,
    };
    try {
      const ratingService = new APIService<SlothRating>(`${Endpoints.sloths}/${slothId}/rating`);
      const userId = getUserId;

      if (!(hasAuth && userId)) throw new APIError('Unauthorized', 401, res.error);

      const body: SlothRating = { slothId, userId, rate };
      return ratingService.update(body);
    } catch (error) {
      errorHandler(error);
    }
    return res;
  }

  public deleteById(id: string) {
    return this.service.deleteById(id);
  }

  public static getTags() {
    const tagsService = new APIService<Tag>(`${Endpoints.sloths}/tags`);

    return tagsService.getAllList();
  }
}

export default SlothsService;
