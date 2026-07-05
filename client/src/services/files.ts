import { FilesApi } from '@client/api';

const filesApi = new FilesApi();

export class FilesService {
  async uploadFile(key: string, data: string) {
    const result = await filesApi.uploadFile(JSON.parse(data) as object, key);
    return result.data;
  }
}
