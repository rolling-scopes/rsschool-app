import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { IUserSession } from '../../../models';
import { CrossCheckMessageAuthorRole } from '../../../models/taskSolutionResult';
import { courseService, CrossCheckService, notificationService } from '../../../services';
import { getTaskSolutionResultById } from '../../../services/taskResults.service';
import { setErrorResponse, setResponse } from '../../utils';
import { getCourseTask } from '../../../services/tasks.service';

export const createMessage = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, taskSolutionResultId, courseTaskId } = ctx.params;
  const { user } = ctx.state as { user: IUserSession };

  const crossCheckService = new CrossCheckService(courseTaskId);
  const [student, taskSolutionResult, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, user.githubId),
    getTaskSolutionResultById(taskSolutionResultId),
    getCourseTask(courseTaskId, true),
  ]);

  if (!student) {
    setErrorResponse(ctx, StatusCodes.BAD_REQUEST, 'not valid student or course');
    return;
  }
  if (!courseTask) {
    setErrorResponse(ctx, StatusCodes.BAD_REQUEST, 'not valid task');
    return;
  }

  if (!taskSolutionResult) {
    setErrorResponse(ctx, StatusCodes.BAD_REQUEST, 'task solution result is not exist');
    return;
  }

  const inputData: {
    content: string;
    role: CrossCheckMessageAuthorRole;
  } = ctx.request.body;

  switch (inputData.role) {
    case CrossCheckMessageAuthorRole.Reviewer:
      if (student.id !== taskSolutionResult.checkerId) {
        setErrorResponse(ctx, StatusCodes.BAD_REQUEST, 'user is not checker');
        return;
      }
      break;

    case CrossCheckMessageAuthorRole.Student:
      if (student.id !== taskSolutionResult.studentId) {
        setErrorResponse(ctx, StatusCodes.BAD_REQUEST, 'user is not student');
        return;
      }
      break;

    default:
      setErrorResponse(ctx, StatusCodes.BAD_REQUEST, 'incorrect message role');
      return;
  }

  const data = {
    content: inputData.content ?? '',
    role: inputData.role,
  };

  await crossCheckService.saveMessage(taskSolutionResultId, data, {
    user: user,
  });

  await notificationService
    .sendNotification({
      userId: inputData.role === CrossCheckMessageAuthorRole.Reviewer ? student.userId : taskSolutionResult.checkerId,
      notificationId: 'messages',
      data: {
        isReviewerMessage: inputData.role === CrossCheckMessageAuthorRole.Reviewer,
        courseAlias: courseTask.course.alias,
        courseTaskId,
        taskName: courseTask.task.name,
        studentGithubId: student.githubId,
      },
    })
    .catch(() => null);

  setResponse(ctx, StatusCodes.OK);
};
