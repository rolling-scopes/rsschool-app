import { ILogger } from '../../logger';
import { RouterContext } from '../guards';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';
import { getAllBestWorks } from '../../services/bestWorks.service';

export const getBestWorks = (_: ILogger) => async (ctx: RouterContext) => {
  const bestWorks = await getAllBestWorks();

  setResponse(ctx, OK, bestWorks);
};
