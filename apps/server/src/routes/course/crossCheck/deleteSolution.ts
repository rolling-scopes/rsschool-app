import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { CrossCheckService } from '../../../services';
import { setResponse } from '../../utils';

export const deleteSolution = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;

  const crossCheckService = new CrossCheckService(courseTaskId);
  const { student, courseTask } = await crossCheckService.getStudentAndTask(courseId, githubId);

  if (student == null || courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or course task' });
    return;
  }
  if (!CrossCheckService.isCrossCheckTask(courseTask)) {
    setResponse(ctx, BAD_REQUEST, { message: 'task solution is not supported for this task' });
    return;
  }

  await crossCheckService.deleteSolution(student.id);

  setResponse(ctx, OK);
};
