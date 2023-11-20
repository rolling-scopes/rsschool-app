import { models } from './models';
import { migrations } from './migrations';
import { DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ssl:
    process.env.RS_ENV === 'staging'
      ? true
      : {
          rejectUnauthorized: false,
        },
  host: process.env.RSSHCOOL_PG_HOST,
  port: process.env.RS_ENV !== 'staging' ? 5432 : undefined,
  username: process.env.RSSHCOOL_PG_USERNAME,
  password: process.env.RSSHCOOL_PG_PASSWORD,
  database: process.env.RSSHCOOL_PG_DATABASE,
  entities: models,
  migrations,
  logging: ['migration', 'error', 'warn'],
};
