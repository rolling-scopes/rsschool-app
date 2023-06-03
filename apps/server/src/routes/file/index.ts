import Router from '@koa/router';
import { ILogger } from '../../logger';
import { guard } from '../guards';
import { uploadFile } from './upload';

export function filesRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/file' });

  router.post('/upload', guard, uploadFile(logger));

  return router;
}
