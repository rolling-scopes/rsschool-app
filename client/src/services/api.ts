import { Configuration } from 'api';

const basePath = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

export function getApiCfg() {
  return new Configuration({ basePath });
}
