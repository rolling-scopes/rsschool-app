import axios, { AxiosInstance } from 'axios';
import { getServerAxiosProps } from 'utils/axios';

export class StudentsService {
  private axios: AxiosInstance;

  constructor(token?: string) {
    this.axios = axios.create(getServerAxiosProps(token, '/api/v2/students'));
  }

  public async getStudent(studentId: number) {
    const result = await this.axios.get(`${studentId}`);
    return result.data;
  }

  public async createFeedback(studentId: number, values: any) {
    const result = await this.axios.post(`${studentId}/feedback`, values);
    return result.data;
  }
}
