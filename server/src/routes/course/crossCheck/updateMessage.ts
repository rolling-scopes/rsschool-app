import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { TaskSolutionResultRole } from '../../../models/taskSolutionResult';
import { CrossCheckService } from '../../../services';
import { getTaskSolutionResultById } from '../../../services/taskResults.service';
import { setErrorResponse, setResponse } from '../../utils';

export const updateMessage = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { taskSolutionResultId, courseTaskId } = ctx.params;

  const crossCheckService = new CrossCheckService(courseTaskId);
  const taskSolutionResult = await getTaskSolutionResultById(taskSolutionResultId);

  if (!taskSolutionResult) {
    setErrorResponse(ctx, BAD_REQUEST, 'task solution result is not exist');
  }

  const inputData: {
    role: TaskSolutionResultRole;
  } = ctx.request.body;

  if (inputData.role !== TaskSolutionResultRole.Student && inputData.role !== TaskSolutionResultRole.Checker) {
    setErrorResponse(ctx, BAD_REQUEST, 'incorrect message role');
    return;
  }

  const data = {
    role: inputData.role,
  };

  await crossCheckService.updateMessage(taskSolutionResultId, data);

  setResponse(ctx, OK);
};
