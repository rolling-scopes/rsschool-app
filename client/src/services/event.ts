import axios from 'axios';
import { DisciplineDto } from 'api';

export interface Event {
  id: number;
  createdDate: string;
  updatedDate: string;
  name: string;
  descriptionUrl: string;
  description: string;
  type: string;
  discipline: DisciplineDto;
  disciplineId: number;
}
export class EventService {
  async getEvent(id: string) {
    const result = await axios.get<{ data: Event }>(`/api/event/${id}`);
    return result.data.data;
  }

  async updateEvent(id: number, data: Partial<Event>) {
    const result = await axios.put<{ data: Event }>(`/api/event/${id}`, data);
    return result.data.data;
  }

  async createEvent(data: Partial<Event>) {
    const result = await axios.post<{ data: Event }>(`/api/event`, data);
    return result.data.data;
  }
}
