import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { CrossCheckStatus } from '../../../models/courseTask';
import { courseService, taskService } from '../../../services';
import { ScoreService } from '../../../services/score';
import { setResponse } from '../../utils';

const DEFAULT_PAIRS_COUNT = 4;

export const createCompletion = (__: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseTaskId, courseId } = ctx.params;

  const courseTask = await taskService.getCourseTask(courseTaskId);

  if (courseTask == null) {
    setResponse(ctx, StatusCodes.BAD_REQUEST);
    return;
  }

  if (!taskService.isSubmissionDeadlinePassed(courseTask) || courseTask.crossCheckStatus === CrossCheckStatus.Initial) {
    setResponse(ctx, StatusCodes.BAD_REQUEST);
    return;
  }

  const scoreService = new ScoreService(Number(courseId));

  const pairsCount = Math.max((courseTask.pairsCount ?? DEFAULT_PAIRS_COUNT) - 1, 1);
  const studentScores = await courseService.getTaskSolutionCheckers(courseTaskId, pairsCount);

  for (const studentScore of studentScores) {
    const data = { authorId: -1, comment: 'Cross-Check score', score: studentScore.score };
    await scoreService.saveScore(studentScore.studentId, courseTaskId, data);
  }

  await taskService.changeCourseTaskStatus(courseTask, CrossCheckStatus.Completed);

  setResponse(ctx, StatusCodes.OK);
};
