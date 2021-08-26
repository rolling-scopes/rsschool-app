import { ILogger } from '../../logger';
import { RouterContext } from '../guards';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';
import { changeBestWork } from '../../services/bestWorks.service';

export const putBestWork = (_: ILogger) => async (ctx: RouterContext) => {
  const { body } = ctx.request;

  const result = await changeBestWork(body);

  setResponse(ctx, OK, result);
};
