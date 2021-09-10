import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { ILogger } from '../../logger';
import { ScoreService } from '../../services/score';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';

export function taskResultRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/taskResult' });

  router.post('/', adminGuard, createPostTaskResult(logger));

  return router;
}

type Input = {
  courseTaskId: string | number;
  score: string | number;
  studentId: string | number;
};

const createPostTaskResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const input: Input = ctx.request.body;
  if (!input.courseTaskId || !input.studentId) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, {});
    return;
  }
  const scoreService = new ScoreService();

  await scoreService.saveScore(Number(input.studentId), Number(input.courseTaskId), {
    score: Number(input.score),
    comment: '',
  });

  setResponse(ctx, StatusCodes.OK);
};
