import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ResumeService } from '../../services/resume.service';
import { setResponse } from '../utils';

const { OK } = StatusCodes;

export const saveResume = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, id: userId } = ctx.state.user;
  const data = ctx.request.body;

  const resumeService = new ResumeService(githubId);
  const result = await resumeService.saveData(userId, data);
  setResponse(ctx, OK, result);
};
