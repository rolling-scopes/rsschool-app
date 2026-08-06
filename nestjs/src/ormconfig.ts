import { DataSourceOptions } from 'typeorm';
import * as path from 'path';
import { models } from '@entities/index';
import { migrations } from './migrations';

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
  entities: models,
  migrations,
  synchronize: false,
  migrationsRun: true,
  // node-postgres pool options. The pool was never configured (pg default: 10
  // connections, no acquire timeout), so under load requests queue indefinitely
  // on the driver. The size stays env-tunable to match the RDS instance class.
  extra: {
    max: Number(process.env.RSSHCOOL_PG_POOL_SIZE) || 20,
    idleTimeoutMillis: 30 * 1000,
    connectionTimeoutMillis: 10 * 1000,
  },
  subscribers: [path.resolve(__dirname, '**/*.subscriber.ts'), path.resolve(__dirname, '**/*.subscriber.js')],
  logging: ['migration', 'error', 'warn'],
};

export default config;
