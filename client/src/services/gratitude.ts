import axios from 'axios';
import { IGratitudeGetResponse, IGratitudeGetRequest } from '@common/interfaces/gratitude';

export class GratitudeService {
  async getGratitude(data?: IGratitudeGetRequest): Promise<{ content: IGratitudeGetResponse[]; count: number }> {
    const result = await axios.get(`/api/feedback/gratitude`, { params: data });
    return result.data.data;
  }
}
