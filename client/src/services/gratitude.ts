import axios from 'axios';
import { IGratitudeGetResponse, IGratitudeGetRequest } from '../../../common/interfaces/gratitude';

export class GratitudeService {
  async postGratitude(data: { toUserId: number; badgeId?: string; comment: string; courseId: number }) {
    const result = await axios.post<{ data: { heroesUrl?: string } }>(`/api/feedback/gratitude`, data);
    return result.data.data;
  }
  async getGratitude(data?: IGratitudeGetRequest): Promise<{ content: IGratitudeGetResponse[]; count: number }> {
    const result = await axios.get(`/api/feedback/gratitude`, { params: data });
    return result.data.data;
  }
}
