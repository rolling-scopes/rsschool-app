import { GratitudesApi, GratitudeItemDto } from '@client/api';
import { IPaginationInfo } from '@client/shared/utils/pagination';

export type HeroesFormData = {
  name?: string;
  githubId?: string;
  courseId?: number;
};

export type IGratitudeGetResponse = GratitudeItemDto;

export type IGratitudeGetRequest = HeroesFormData & Partial<IPaginationInfo>;

const gratitudesApi = new GratitudesApi();

export class GratitudeService {
  async getGratitude(data?: IGratitudeGetRequest): Promise<{ content: IGratitudeGetResponse[]; count: number }> {
    const { data: result } = await gratitudesApi.getGratitudes(
      data?.name,
      data?.githubId,
      data?.courseId,
      data?.pageSize ? Number(data.pageSize) : undefined,
      data?.current ? Number(data.current) : undefined,
    );
    return result;
  }
}
