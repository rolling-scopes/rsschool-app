import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { IUserSession } from '../../../models';
import { TaskSolutionComment, TaskSolutionReview } from '../../../models/taskSolution';

import {
  courseService,
  CrossCheckService,
  notificationService,
  taskResultsService,
  taskService,
} from '../../../services';
import { setErrorResponse, setResponse } from '../../utils';

export const createResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
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
  if (!CrossCheckService.isCrossCheckTask(courseTask)) {
    setErrorResponse(ctx, BAD_REQUEST, 'task solution is supported for this task');
    return;
  }

  const taskChecker = await taskResultsService.getTaskSolutionChecker(student.id, checker.id, courseTaskId);
  if (taskChecker == null) {
    setErrorResponse(ctx, BAD_REQUEST, 'no assigned cross-check');
    return;
  }

  const inputData: {
    score: number;
    comment: string;
    anonymous: boolean;
    review: TaskSolutionReview[];
    comments: TaskSolutionComment[];
  } = ctx.request.body;

  const data = {
    score: Math.round(Number(inputData.score)),
    comment: inputData.comment || '',
    anonymous: inputData.anonymous !== false,
    review: Array.isArray(inputData.review) ? inputData.review : [],
  };

  if (isNaN(data.score) || data.score < 0) {
    setErrorResponse(ctx, BAD_REQUEST, 'no score provided');
    return;
  }

  await crossCheckService.saveResult(taskChecker.studentId, taskChecker.checkerId, data, {
    userId: user.id,
  });

  await crossCheckService.saveSolutionComments(taskChecker.studentId, courseTaskId, {
    comments: inputData.comments ?? [],
    authorId: taskChecker.checkerId,
    authorGithubId: user.githubId,
    recipientId: taskChecker.studentId,
  });

  await notificationService.sendNotification({
    userId: student.userId,
    notificationId: 'taskGrade',
    data: {
      courseTask,
      score: data.score,
      comment: data.comment,
    },
  });

  setResponse(ctx, OK);
};
