import Router from 'koa-router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { studentsService } from '../../services';

export const getExternalAccounts = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const students = await studentsService.getExternalAccounts(courseId);
  setResponse(ctx, OK, students);
};
