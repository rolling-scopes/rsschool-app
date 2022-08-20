import { DataSource } from 'typeorm';
import { dataSourceOptions } from './dataSourceOptions';

export default new DataSource(dataSourceOptions);
