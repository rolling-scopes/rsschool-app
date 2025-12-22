import { IPaginationInfo } from '@client/shared/utils/pagination';
import axios from 'axios';

export type HeroesFormData = {
  name?: string;
  githubId?: string;
  courseId?: number;
};

export interface IGratitudeGetResponse {
  activist: boolean;
  cityName: string;
  countryName: string;
  comment: string;
  badgeId: string;
  date: string;
  id: number;
  firstName: string;
  githubId: string;
  lastName: string;
  user_id: number;
  from: {
    firstName: string;
    githubId: string;
    lastName: string;
  };
}

export type IGratitudeGetRequest = HeroesFormData & Partial<IPaginationInfo>;

export class GratitudeService {
  async getGratitude(data?: IGratitudeGetRequest): Promise<{ content: IGratitudeGetResponse[]; count: number }> {
    const result = await axios.get(`/api/feedback/gratitude`, { params: data });
    return result.data.data;
  }
}
