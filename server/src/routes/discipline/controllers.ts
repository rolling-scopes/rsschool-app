import { ILogger } from '../../logger';
import { RouterContext } from '../guards';
import {
  deleteDisciplineRepository,
  postDisciplineRepository,
  updateDisciplineRepository,
} from '../../services/discipline.service';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';

export const postDiscipline = (_: ILogger) => async (ctx: RouterContext) => {
  const { body } = ctx.request;

  const discipline = await postDisciplineRepository(body);

  setResponse(ctx, OK, discipline);
};

export const updateDiscipline = (_: ILogger) => async (ctx: RouterContext) => {
  const { body } = ctx.request;
  const { id } = ctx.params;

  const discipline = await updateDisciplineRepository(id, body);

  setResponse(ctx, OK, discipline);
};

export const deleteDiscipline = (_: ILogger) => async (ctx: RouterContext) => {
  const { id } = ctx.params;

  const discipline = await deleteDisciplineRepository(id);

  setResponse(ctx, OK, discipline);
};
