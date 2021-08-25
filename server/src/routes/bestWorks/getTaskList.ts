import { ILogger } from '../../logger';
import { RouterContext } from '../guards';
import { setResponse } from '../utils';
import { OK } from 'http-status-codes';
import { getCourseTaskListWithBestWorks } from '../../services/bestWorks.service';

export const getTaskList = (_: ILogger) => async (ctx: RouterContext) => {
  const { id } = ctx.params;
  const tasks = await getCourseTaskListWithBestWorks(Number(id));

  setResponse(ctx, OK, tasks);
};
