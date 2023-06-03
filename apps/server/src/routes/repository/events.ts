import { ILogger } from '../../logger';
import { RepositoryEvent } from '../../models';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
import { RepositoryEventRepository } from '../../repositories/repositoryEvent.repository';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';
import { updateRepositoryActivity } from '../../services/student.service';

export const createRepositoryEvents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data: Pick<RepositoryEvent, 'action' | 'githubId' | 'repositoryUrl'>[] = ctx.request.body;
  await getCustomRepository(RepositoryEventRepository).save(data);

  await Promise.all(data.map(it => updateRepositoryActivity(it.repositoryUrl)));

  setResponse(ctx, OK);
};
