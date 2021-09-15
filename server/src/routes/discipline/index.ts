import { ILogger } from '../../logger';
import Router from '@koa/router';
import { createGetAllRoute, createGetRoute } from '../common';
import { Discipline } from '../../models/discipline';
import { deleteDiscipline, postDiscipline, updateDiscipline } from './controllers';

export function disciplineRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/discipline' });

  router
    .get('/', createGetAllRoute(Discipline, { take: 100, skip: 0 }, logger))
    .get('/:id', createGetRoute(Discipline, logger))
    .post('/', postDiscipline(logger))
    .put('/:id', updateDiscipline(logger))
    .delete('/:id', deleteDiscipline(logger));

  return router;
}
