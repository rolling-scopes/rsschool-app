import globalAxios, { AxiosInstance } from 'axios';

export class FilesService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = globalAxios.create({ baseURL: `/api` });
  }

  async uploadFile(key: string, data: string) {
    const result = await this.axios.post(`/file/upload?key=${key}`, JSON.parse(data));
    return result.data.data as { s3Key: string };
  }
}
