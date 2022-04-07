import Router from '@koa/router';
import { AxiosError } from 'axios';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { isAdmin, isManager, isTaskOwner, IUserSession } from '../../../models';
import { courseService, notificationService, taskService } from '../../../services';
import { ScoreService } from '../../../services/score';
import { setResponse } from '../../utils';

type ScoreInput = {
  score: number | string;
  comment?: string;
  githubPrUrl?: string;
};

export const createSingleScore = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, courseTaskId, githubId } = ctx.params;
  const session = ctx.state.user as IUserSession;

  const inputData: ScoreInput = ctx.request.body;

  const scoreService = new ScoreService(courseId);

  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  if (Number.isNaN(Number(inputData.score))) {
    setResponse(ctx, BAD_REQUEST, 'no score');
    return;
  }
  const data = {
    score: Math.round(Number(inputData.score)),
    comment: inputData.comment || '',
    githubPrUrl: inputData.githubPrUrl,
  };
  logger.info(data);

  const authorId = ctx.state.user.id;
  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid course task' });
    return;
  }

  const mentor = await courseService.getMentorByUserId(courseId, authorId);

  const isNotTaskOwner = !isTaskOwner(session, courseId);
  if (mentor == null && !isAdmin(session) && !isManager(session, courseId) && isNotTaskOwner) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid submitter' });
    return;
  }

  const result = scoreService.saveScore(student.id, courseTask.id, { ...data, authorId });
  setResponse(ctx, OK, result);

  try {
    await notificationService.sendNotification({
      userId: student.userId,
      notificationId: 'taskGrade',
      data: {
        courseTask,
        score: data.score,
        comment: data.comment,
      },
    });
  } catch (e) {
    logger.error(`Failed to publish notification ${(e as AxiosError).message}`);
  }
};
