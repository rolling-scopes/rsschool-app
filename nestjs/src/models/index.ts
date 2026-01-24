import { TestUser } from './testUser';

const isDev = process.env.NODE_ENV !== 'production';

export const models = isDev ? [TestUser] : [];
