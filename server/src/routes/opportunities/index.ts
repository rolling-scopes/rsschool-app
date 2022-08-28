import Router from '@koa/router';
import { ILogger } from '../../logger';
import { guard } from '../guards';
import { getResume } from './getResume';
import { saveResume } from './saveResume';
import { updateVisibility } from './updateVisibility';

export function opportunitiesRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/opportunities' });

  router.get('/resume', guard, getResume(logger));
  router.post('/resume', guard, saveResume(logger));

  router.post('/visibility', guard, updateVisibility(logger));

  return router;
}
