import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { MentorService } from '../../../services/mentor.service';
import { setResponse } from '../../utils';

export const createMentors = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data: { githubId: string; maxStudentsLimit: number }[] = ctx.request.body;

  if (data === undefined || !courseId) {
    setResponse(ctx, StatusCodes.NOT_FOUND);
    return;
  }

  const service = new MentorService(courseId, logger);
  const result = await service.createMentors(data);

  setResponse(ctx, StatusCodes.OK, result);
};
