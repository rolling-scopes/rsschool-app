import { DataSourceOptions } from 'typeorm';
import * as path from 'path';
import { models as baseModels } from '@entities/index';
import { migrations } from './migrations';
import { models as nestModels } from './models';

const config: DataSourceOptions = {
  type: 'postgres',
  ssl: process.env.RS_ENV
    ? {
        rejectUnauthorized: false,
      }
    : undefined, // localhost should not use ssl
  host: process.env.RSSHCOOL_PG_HOST,
  port: process.env.RS_ENV !== 'staging' ? 5432 : undefined,
  username: process.env.RSSHCOOL_PG_USERNAME,
  password: process.env.RSSHCOOL_PG_PASSWORD,
  database: process.env.RSSHCOOL_PG_DATABASE,
  entities: [...baseModels, ...nestModels],
  migrations,
  synchronize: process.env.NODE_ENV !== 'production',
  migrationsRun: false,
  subscribers: [path.resolve(__dirname, '**/*.subscriber.*')],
  logging: ['migration', 'error', 'warn'],
};

export default config;
