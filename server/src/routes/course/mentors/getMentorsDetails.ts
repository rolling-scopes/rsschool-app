import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { MentorService } from '../../../services/mentor.service';
import { setResponse } from '../../utils';

export const getMentorsDetails = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const service = new MentorService(courseId, logger);
  const result = await service.getMentorsWithStats();
  setResponse(ctx, StatusCodes.OK, result);
};
