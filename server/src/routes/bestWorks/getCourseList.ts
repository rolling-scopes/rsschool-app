import { ILogger } from '../../logger';
import { RouterContext } from '../guards';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';
import { getCourseListWithBestWorks } from '../../services/bestWorks.service';

export const getCourseList = (_: ILogger) => async (ctx: RouterContext) => {
  const courses = await getCourseListWithBestWorks();

  setResponse(ctx, OK, courses);
};
