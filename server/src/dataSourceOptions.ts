import { models } from './models';
import { migrations } from './migrations';
import { DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.RSSHCOOL_API_PG_HOST,
  port: 5432,
  username: process.env.RSSHCOOL_API_PG_USERNAME,
  password: process.env.RSSHCOOL_API_PG_PASSWORD,
  database: process.env.RSSHCOOL_API_PG_DATABASE,
  entities: models,
  migrations,
  logging: ['migration', 'error', 'warn'],
};
