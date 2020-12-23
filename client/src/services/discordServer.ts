import axios from 'axios';
import { DiscordServer } from './models';

type DiscordServerResponse = { data: DiscordServer };
type DiscordServersResponse = { data: DiscordServer[] };

export class DiscordServerService {
  async deleteDiscordServer(id: number) {
    const result = await axios.delete<DiscordServerResponse>(`/api/discord-server/${id}`);
    return result.data.data;
  }

  async updateDiscordServer(id: number, data: Partial<DiscordServer>) {
    const result = await axios.put<DiscordServerResponse>(`/api/discord-server/${id}`, data);
    return result.data.data;
  }

  async createDiscordServer(data: Partial<DiscordServer>) {
    const result = await axios.post<DiscordServerResponse>(`/api/discord-server/`, data);
    return result.data.data;
  }

  async getDiscordServers() {
    const result = await axios.get<DiscordServersResponse>(`/api/discord-server`);
    return result.data.data;
  }
}
