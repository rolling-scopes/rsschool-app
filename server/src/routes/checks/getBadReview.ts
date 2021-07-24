import { OK } from 'http-status-codes';
import { RouterContext } from '../guards';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
export const getBadReview = (logger: ILogger) => (ctx: RouterContext) => {
  try {
  } catch (error) {
    logger.error(error);
  }

  setResponse(ctx, OK, 'Check');
};
