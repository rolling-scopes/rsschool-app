import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ResumeService } from '../../services/resume.service';
import { setResponse } from '../utils';

const { NOT_FOUND, OK } = StatusCodes;

export const getResume = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { mod } = ctx.query;
  const { githubId } = ctx.state.user;
  const isFullDataNeeded = mod === 'all';

  const service = new ResumeService(githubId, logger);
  const data = await service.getData(isFullDataNeeded);

  if (data == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, data);
};
