import { ILogger } from '../../logger';
import { RouterContext } from '../guards';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';
import { getBestWorksByTaskId } from '../../services/bestWorks.service';

export const getBestWorksByTask = (_: ILogger) => async (ctx: RouterContext) => {
  const { taskId } = ctx.params;

  const bestWorks = await getBestWorksByTaskId(Number(taskId));

  setResponse(ctx, OK, bestWorks);
};
