import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { IUserSession } from '../../../models';
import { courseService, CrossCheckService, taskResultsService, taskService } from '../../../services';
import { setErrorResponse, setResponse } from '../../utils';

export const getResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;
  const { user } = ctx.state as { user: IUserSession };

  const crossCheckService = new CrossCheckService(courseTaskId);

  const [student, checker, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    courseService.queryStudentByGithubId(courseId, user.githubId),
    taskService.getCourseTask(courseTaskId),
  ]);

  if (student == null || courseTask == null || checker == null) {
    setErrorResponse(ctx, BAD_REQUEST, 'not valid student or course task');
    return;
  }
  if (courseTask.checker !== 'crossCheck') {
    setErrorResponse(ctx, BAD_REQUEST, 'task solution is supported for this task');
    return;
  }
  const taskChecker = await taskResultsService.getTaskSolutionChecker(student.id, checker.id, courseTaskId);
  if (taskChecker == null) {
    setErrorResponse(ctx, BAD_REQUEST, 'no assigned cross-check');
    return;
  }
  const existingResult = await crossCheckService.getResult(student.id, checker.id);
  setResponse(ctx, OK, existingResult);
};
