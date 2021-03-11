import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { TaskSolution } from '../../../models';
import { CrossCheckService } from '../../../services';
import { setResponse } from '../../utils';

export const createSolution = (_: ILogger) => async (ctx: Router.RouterContext) => {
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

  const { review, url, comments }: Partial<TaskSolution> = ctx.request.body ?? {};
  const taskSolution = {
    review,
    url,
    comments: comments?.map(c => ({ ...c, authorId: student.id })),
  };
  if (!CrossCheckService.isValidTaskSolution(taskSolution)) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid request payload' });
    return;
  }

  await crossCheckService.saveSolution(student.id, taskSolution);

  setResponse(ctx, OK);
};
