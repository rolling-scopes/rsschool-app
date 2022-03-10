import axios, { AxiosInstance } from 'axios';
import { DiscordServer } from './models';

type DiscordServerResponse = { data: DiscordServer };
type DiscordServersResponse = { data: DiscordServer[] };

export class DiscordServerService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({ baseURL: `/api/v2` });
  }

  async createDiscordServer(data: Partial<DiscordServer>) {
    const result = await this.axios.post<DiscordServerResponse>(`/discord-servers`, data);
    return result.data;
  }

  async getDiscordServers() {
    const result = await this.axios.get<DiscordServersResponse>(`/discord-servers`);
    return result.data;
  }

  async updateDiscordServer(id: number, data: Partial<DiscordServer>) {
    const result = await this.axios.put<DiscordServerResponse>(`/discord-servers/${id}`, data);
    return result.data;
  }

  async deleteDiscordServer(id: number) {
    const result = await this.axios.delete<DiscordServerResponse>(`/discord-servers/${id}`);
    return result.data;
  }
}
