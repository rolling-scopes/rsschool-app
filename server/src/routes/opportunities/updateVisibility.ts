import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ResumeService } from '../../services/resume.service';
import { setResponse } from '../utils';

const { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes;

export const updateVisibility = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { isHidden } = ctx.request.body;
  const { githubId } = ctx.state.user;
  const service = new ResumeService(githubId, logger);
  try {
    const result = await service.setVisibility(!isHidden);
    setResponse(ctx, OK, result);
  } catch (err) {
    if (err === NOT_FOUND) {
      setResponse(ctx, NOT_FOUND);
      return;
    }
    setResponse(ctx, INTERNAL_SERVER_ERROR);
  }
};
