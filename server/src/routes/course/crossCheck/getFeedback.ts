import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { taskResultsService, CrossCheckService } from '../../../services';
import { setResponse } from '../../utils';

export const getFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;
  const crossCheckService = new CrossCheckService(courseTaskId);
  const { student, courseTask } = await crossCheckService.getStudentAndTask(courseId, githubId);

  if (student == null || courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or course task' });
    return;
  }
  if (!CrossCheckService.isCrossCheckTask(courseTask)) {
    setResponse(ctx, BAD_REQUEST, { message: 'not supported task' });
    return;
  }

  const feedback = await taskResultsService.getTaskSolutionFeedback(student.id, courseTaskId);
  const response = {
    url: feedback.url,
    comments: feedback.comments,
  };
  setResponse(ctx, OK, response);
};
