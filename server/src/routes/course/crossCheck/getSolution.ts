import Router from '@koa/router';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { courseService, taskResultsService, taskService } from '../../../services';
import { setResponse } from '../../utils';

export const getSolution = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;

  const [student, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    taskService.getCourseTask(courseTaskId),
  ]);

  if (student == null || courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or course task' });
    return;
  }

  const result = await taskResultsService.getTaskSolution(student.id, courseTask.id);

  if (result == null) {
    setResponse(ctx, NOT_FOUND, { message: 'solution is not found ' });
    return;
  }

  const { updatedDate, id, url, review, comments } = result;

  setResponse(ctx, OK, {
    updatedDate,
    id,
    url,
    review,
    comments: comments.filter(c => c.authorId == student.id && c.recipientId == null),
  });
};
