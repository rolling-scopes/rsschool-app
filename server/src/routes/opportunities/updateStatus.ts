import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ResumeService } from '../../services/resume.service';
import { setResponse } from '../utils';

const { OK } = StatusCodes;

export const updateStatus = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state.user;
  const resumeService = new ResumeService(githubId);
  const result = await resumeService.updateStatus();
  setResponse(ctx, OK, Number(result.expires));
};
