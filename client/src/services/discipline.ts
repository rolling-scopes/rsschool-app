import { message } from 'antd';
import { DisciplinesApi, CreateDisciplineDto, UpdateDisciplineDto } from 'api';
import { getApiConfiguration } from '../utils/axios';

export class DisciplineService {
  private readonly disciplineApi: DisciplinesApi;

  constructor(token?: string) {
    this.disciplineApi = new DisciplinesApi(getApiConfiguration(token));
  }

  async getAllDisciplines() {
    try {
      const result = await this.disciplineApi.getDisciplines();
      return result.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async postDiscipline(data: CreateDisciplineDto) {
    try {
      const result = await this.disciplineApi.createDiscipline(data);
      return result.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async deleteDiscipline(id: number) {
    try {
      const result = await this.disciplineApi.deleteDiscipline(id);
      return result.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }

  async updateDiscipline(id: number, data: UpdateDisciplineDto) {
    try {
      const result = await this.disciplineApi.updateDiscipline(id, data);
      return result.data;
    } catch (e) {
      message.error('Something went wrong');
    }
  }
}
