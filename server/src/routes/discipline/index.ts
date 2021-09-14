import { ILogger } from '../../logger';
import Router from '@koa/router';
import { createDeleteRoute, createGetAllRoute, createGetRoute, createPostRoute, createPutRoute } from '../common';
import { Discipline } from '../../models/discipline';

export function disciplineRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/discipline' });

  router
    .get('/', createGetAllRoute(Discipline, { take: 100, skip: 0 }, logger))
    .get('/:id', createGetRoute(Discipline, logger))
    .post('/', createPostRoute(Discipline, logger))
    .put('/:id', createPutRoute(Discipline, logger))
    .delete('/:id', createDeleteRoute(Discipline, logger));

  return router;
}
