import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { StageInterview } from '../../../models';
import { setResponse } from '../../utils';

export const deleteInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const interviewId = Number(ctx.params.interviewId);
  try {
    const interview = await getRepository(StageInterview).delete(interviewId);
    setResponse(ctx, StatusCodes.OK, interview);
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};
