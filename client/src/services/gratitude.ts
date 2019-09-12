import axios from 'axios';

export class GratitudeService {
  async postGratitude(data: { toUserId: number; badgeId?: string; comment: string }) {
    const result = await axios.post<{ data: { heroesUrl?: string } }>(`/api/feedback/gratitude`, data);
    return result.data.data;
  }
}
