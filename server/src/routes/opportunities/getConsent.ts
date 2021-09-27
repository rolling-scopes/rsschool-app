import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ResumeService } from '../../services/resume.service';
import { setResponse } from '../utils';

const { OK } = StatusCodes;

export const getConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const githubId: string = ctx.params.githubId;
  const service = new ResumeService(githubId);

  const data = await service.getConsent();
  setResponse(ctx, OK, data);
};
