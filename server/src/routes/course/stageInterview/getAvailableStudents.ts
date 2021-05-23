import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { stageInterviewService } from '../../../services';
import { setResponse } from '../../utils';

export const getAvailableStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const result = await stageInterviewService.getAvailableStudents(courseId);
  setResponse(ctx, StatusCodes.OK, result);
};
