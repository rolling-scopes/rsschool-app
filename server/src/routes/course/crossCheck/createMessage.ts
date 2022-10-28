import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { IUserSession } from '../../../models';
import { TaskSolutionResultRole } from '../../../models/taskSolutionResult';
import { courseService, CrossCheckService } from '../../../services';
import { getTaskSolutionResultById } from '../../../services/taskResults.service';
import { setErrorResponse, setResponse } from '../../utils';

export const createMessage = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, taskSolutionResultId, courseTaskId } = ctx.params;
  const { user } = ctx.state as { user: IUserSession };

  const crossCheckService = new CrossCheckService(courseTaskId);
  const student = await courseService.queryStudentByGithubId(courseId, user.githubId);

  if (!student) {
    setErrorResponse(ctx, BAD_REQUEST, 'not valid student or course');
    return;
  }

  const taskSolutionResult = await getTaskSolutionResultById(taskSolutionResultId);

  if (!taskSolutionResult) {
    setErrorResponse(ctx, BAD_REQUEST, 'task solution result is not exist');
    return;
  }

  const inputData: {
    content: string;
    role: TaskSolutionResultRole;
  } = ctx.request.body;

  switch (inputData.role) {
    case TaskSolutionResultRole.Checker:
      if (student.id !== taskSolutionResult.checkerId) {
        setErrorResponse(ctx, BAD_REQUEST, 'user is not checker');
        return;
      }
      break;

    case TaskSolutionResultRole.Student:
      if (student.id !== taskSolutionResult.studentId) {
        setErrorResponse(ctx, BAD_REQUEST, 'user is not student');
        return;
      }
      break;

    default:
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
