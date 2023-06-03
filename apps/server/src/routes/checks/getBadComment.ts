import { OK } from 'http-status-codes';
import { RouterContext } from '../guards';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { getCheckersWithoutComments } from '../../services/check.service';

export const getBadComment = (_: ILogger) => async (ctx: RouterContext) => {
  const { taskId } = ctx.params;

  const badCheckers = await getCheckersWithoutComments(Number(taskId));

  setResponse(ctx, OK, badCheckers);
};
