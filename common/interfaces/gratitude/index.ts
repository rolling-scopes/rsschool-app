import { IPaginationInfo } from '../../types/pagination';
import { HeroesFormData } from '../../../client/src/components/Forms/Heroes/types';

export interface IGratitudeGetResponse {
  activist: boolean;
  badges: string[];
  cityName: string;
  countryName: string;
  firstName: string;
  githubId: string;
  lastName: string;
  gratitudeCount: string;
  user_id: number;
}

export type IGratitudeGetRequest = HeroesFormData & Partial<IPaginationInfo>;
