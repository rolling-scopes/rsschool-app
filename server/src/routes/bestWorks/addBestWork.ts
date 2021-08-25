import { ILogger } from '../../logger';
import { RouterContext } from '../guards';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';
import { postBestWork } from '../../services/bestWorks.service';

export const addBestWork = (_: ILogger) => async (ctx: RouterContext) => {
  const { body } = ctx.request;

  const result = await postBestWork(body);

  setResponse(ctx, OK, result);
};
