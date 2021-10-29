import { ConnectionOptions } from 'typeorm';
import { entities } from './entities';
import { migrations } from './migrations';

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.RSSHCOOL_PG_HOST,
  port: 5432,
  username: process.env.RSSHCOOL_PG_USERNAME,
  password: process.env.RSSHCOOL_PG_PASSWORD,
  database: process.env.RSSHCOOL_PG_DATABASE,
  entities,
  migrations,
  synchronize: false,
  migrationsRun: false,
  cli: {
    migrationsDir: 'src/migrations',
  },
  logging: ['migration', 'error', 'warn'],
};

export = config;
