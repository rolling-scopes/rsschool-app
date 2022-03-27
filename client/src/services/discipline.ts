import axios, { AxiosInstance } from 'axios';
import { message } from 'antd';
import { IDiscipline } from '../modules/Discipline/model';
import { getServerAxiosProps } from '../utils/axios';

export class DisciplineService {
  private axios: AxiosInstance;

  constructor(token?: string) {
    this.axios = axios.create(getServerAxiosProps(token));
  }

  async getAllDisciplines() {
    try {
      const result = await this.axios.get('/api/v2/disciplines');
      return result.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async postDiscipline(data: Partial<IDiscipline>) {
    try {
      const result = await this.axios.post('/api/v2/disciplines', data);
      return result.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async deleteDiscipline(id: number) {
    try {
      const result = await this.axios.delete(`/api/v2/disciplines/${id}`);
      return result.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async updateDiscipline(id: number, data: Partial<IDiscipline>) {
    try {
      const result = await axios.patch(`/api/v2/disciplines/${id}`, data);
      return result.data.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }
}
