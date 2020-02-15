import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { getInterviewsByStudent } from '../../services/courseService';
import { getStageInterviewsByStudent } from '../../services/stageInterviews';
import { setResponse } from '../utils';

export const getStudentInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const interviews = await getInterviewsByStudent(courseId, githubId);
  const stageInterviews = await getStageInterviewsByStudent(courseId, githubId);
  setResponse(ctx, OK, stageInterviews.concat(interviews));
};
