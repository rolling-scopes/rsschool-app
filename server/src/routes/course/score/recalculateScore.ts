import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { getCourse } from '../../../services/course.service';
import { ScoreService } from '../../../services/score';
import { setResponse } from '../../utils';

export const recalculateScore = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);

  const course = await getCourse(courseId);

  await ScoreService.recalculateTotalScore(logger, course ? [course] : undefined);

  setResponse(ctx, StatusCodes.OK);
};
