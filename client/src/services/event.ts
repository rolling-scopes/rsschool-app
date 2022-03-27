import axios from 'axios';

export interface Event {
  id: number;
  createdDate: string;
  updatedDate: string;
  name: string;
  descriptionUrl: string;
  description: string;
  type: string;
  discipline: string;
}
export class EventService {
  async getEvents() {
    const result = await axios.get<{ data: Event[] }>(`/api/events`);
    return result.data.data.sort((a, b) => b.id - a.id);
  }

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

  async deleteEvent(id: number) {
    const result = await axios.delete<{ data: Event }>(`/api/event/${id}`);
    return result.data.data;
  }
}
