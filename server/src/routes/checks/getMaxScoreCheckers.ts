import { OK } from 'http-status-codes';
import { RouterContext } from '../guards';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { getCheckersWithMaxScore } from '../../services/check.service';

export const getMaxScoreCheckers = (_: ILogger) => async (ctx: RouterContext) => {
  const { taskId } = ctx.params;

  const badCheckers = await getCheckersWithMaxScore(Number(taskId));

  setResponse(ctx, OK, badCheckers);
};
