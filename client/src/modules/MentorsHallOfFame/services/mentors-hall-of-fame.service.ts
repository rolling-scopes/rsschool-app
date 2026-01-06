import axios from 'axios';
import { TopMentor } from '../types';

export class MentorsHallOfFameService {
  async getTopMentors(): Promise<TopMentor[]> {
    const response = await axios.get<TopMentor[]>('/api/v2/mentors-hall-of-fame');
    return response.data;
  }
}
