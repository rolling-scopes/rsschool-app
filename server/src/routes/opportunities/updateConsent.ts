import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ResumeService } from '../../services/resume.service';
import { setResponse } from '../utils';

const { OK, CONFLICT, INTERNAL_SERVER_ERROR } = StatusCodes;

export const updateConsent = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state.user;
  const { consent } = ctx.request.body;
  const service = new ResumeService(githubId, logger);

  try {
    const data = await service.updateConsent(Boolean(consent));
    setResponse(ctx, OK, data);
  } catch (err) {
    switch (err) {
      case CONFLICT:
        setResponse(ctx, CONFLICT, { message: 'CV already exists' });
        break;
      default:
        setResponse(ctx, INTERNAL_SERVER_ERROR, { message: 'CV update failed' });
    }
  }
};
