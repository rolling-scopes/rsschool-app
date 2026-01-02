import axios from 'axios';
import { PaginatedTopMentors } from '../types';

export class MentorsHallOfFameService {
  async getTopMentors(page: number = 1, limit: number = 20): Promise<PaginatedTopMentors> {
    const response = await axios.get<PaginatedTopMentors>('/api/v2/mentors-hall-of-fame', {
      params: { page, limit },
    });
    return response.data;
  }
}
