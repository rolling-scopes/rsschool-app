import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { IUserSession } from '../../../models';
import { TaskSolutionResultRole } from '../../../models/taskSolutionResult';
/* import { courseService, CrossCheckService, taskResultsService, taskService } from '../../../services'; */
import { CrossCheckService } from '../../../services';
import { getTaskSolutionResultById } from '../../../services/taskResults.service';
import { setErrorResponse, setResponse } from '../../utils';

export const createMessage = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { taskSolutionResultId, courseTaskId } = ctx.params;
  const { user } = ctx.state as { user: IUserSession };

  const crossCheckService = new CrossCheckService(courseTaskId);

  /* const [student, checker, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    courseService.queryStudentByGithubId(courseId, user.githubId),
    taskService.getCourseTask(courseTaskId, true),
  ]); */

  /* if (student == null || courseTask == null || checker == null) {
    setErrorResponse(ctx, BAD_REQUEST, 'not valid student or course task');
    return;
  } */
  /* if (!CrossCheckService.isCrossCheckTask(courseTask)) {
    setErrorResponse(ctx, BAD_REQUEST, 'task solution is not supported for this task');
    return;
  } */

  const taskSolutionResult = await getTaskSolutionResultById(taskSolutionResultId);

  if (!taskSolutionResult) {
    setErrorResponse(ctx, BAD_REQUEST, 'task solution result is not exist');
  }

  // TODO is student exists

  const inputData: {
    content: string;
    role: TaskSolutionResultRole;
  } = ctx.request.body;

  if (inputData.role !== TaskSolutionResultRole.Student && inputData.role !== TaskSolutionResultRole.Checker) {
    setErrorResponse(ctx, BAD_REQUEST, 'incorrect message role');
    return;
  }

  const data = {
    content: inputData.content ?? '',
    role: inputData.role,
  };

  await crossCheckService.saveMessage(taskSolutionResultId, data, {
    user: user,
  });

  setResponse(ctx, OK);
};
