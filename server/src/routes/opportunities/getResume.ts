import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ResumeService } from '../../services/resume.service';
import { setResponse } from '../utils';

const { NOT_FOUND, OK } = StatusCodes;

export const getResume = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { mod, githubId } = ctx.query;

  const service = new ResumeService(githubId);

  let data = null;

  if (mod === 'view') {
    data = await service.getViewData();
  }

  if (mod === 'form') {
    data = await service.getFormData();
  }

  if (data === null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, data);
};
