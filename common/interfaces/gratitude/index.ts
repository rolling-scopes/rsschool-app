import { IPaginationInfo } from '../../types/pagination';
import { HeroesFormData } from '../../../client/src/components/Forms/Heroes/types';

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
