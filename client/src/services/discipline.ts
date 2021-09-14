import globalAxios, { AxiosInstance } from 'axios';
import { message } from 'antd';
import { GetServerSidePropsContext, NextPageContext } from 'next';
import { getServerAxiosProps } from '../utils/axios';
import { IDiscipline } from '../modules/Discipline/model';

export class DisciplineService {
  private axios: AxiosInstance;

  constructor(ctx?: GetServerSidePropsContext | NextPageContext) {
    this.axios = globalAxios.create(getServerAxiosProps(ctx));
  }

  async getAllDisciplines() {
    try {
      const result = await this.axios.get('/api/discipline');
      return result.data.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async postDiscipline(data: IDiscipline) {
    try {
      const result = await this.axios.post('/api/discipline', data);
      return result.data.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async deleteDiscipline(id: number) {
    try {
      const result = await this.axios.delete(`/api/discipline/${id}`);
      return result.data.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async updateDiscipline(id: number, data: IDiscipline) {
    try {
      const result = await this.axios.put(`/api/discipline/${id}`, data);
      return result.data.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }
}
