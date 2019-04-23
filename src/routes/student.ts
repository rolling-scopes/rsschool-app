import * as Router from 'koa-router';
import { Student } from '../models';
import { ILogger } from '../logger';
import { createGetRoute } from './common';

export function adminStudentRouter(logger: ILogger) {
  const router = new Router({ prefix: '/v2/student' });
  router.get('/:id', createGetRoute(Student, logger, ['user']));
  return router;
}
