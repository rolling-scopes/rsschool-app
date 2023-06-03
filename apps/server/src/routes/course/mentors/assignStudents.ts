import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { MentorService } from '../../../services/mentor.service';
import { setResponse } from '../../utils';

export const assignStudents = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const service = new MentorService(courseId, logger);
  await service.assignStudentsRandomly();

  setResponse(ctx, StatusCodes.OK);
};
