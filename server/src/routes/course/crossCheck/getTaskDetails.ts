import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { CrossCheckService } from '../../../services';
import { setResponse } from '../../utils';

export const getTaskDetails = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseTaskId } = ctx.params;
  const crossCheckService = new CrossCheckService(courseTaskId);
  const { criteria } = await crossCheckService.getTaskDetails();

  const response = {
    criteria,
  };
  setResponse(ctx, OK, response);
};
