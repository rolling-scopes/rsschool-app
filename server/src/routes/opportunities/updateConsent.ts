import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { IUserSession } from '../../models/session';
import { ResumeService } from '../../services/resume.service';
import { setResponse } from '../utils';

const { OK, CONFLICT, INTERNAL_SERVER_ERROR } = StatusCodes;

export const updateConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { id: userId } = ctx.state.user as IUserSession;
  const { githubId, consent } = ctx.request.body;
  const service = new ResumeService(githubId);
  try {
    const data = await service.updateConsent(userId, Boolean(consent));
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
