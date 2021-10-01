import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ApplicantService } from '../../services/applicant.service';
import { setResponse } from '../utils';

const { OK } = StatusCodes;

export const getApplicants = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const onlyVisible = !ctx.state?.user?.isAdmin;
  const applicantService = new ApplicantService();

  const data = await applicantService.getApplicants(onlyVisible);

  setResponse(ctx, OK, data);
};
