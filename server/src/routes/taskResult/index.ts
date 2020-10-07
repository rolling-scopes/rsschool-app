import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { TaskResult } from '../../models';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';
import { taskResultsService } from '../../services';

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
    setResponse(ctx, BAD_REQUEST, {});
    return;
  }
  const data = taskResultsService.createTaskResult(0, {
    courseTaskId: Number(input.courseTaskId),
    studentId: Number(input.studentId),
    score: Number(input.score),
    comment: '',
  });
  const { courseTaskId, studentId } = data;
  const existing = await getRepository(TaskResult).findOne({ where: { courseTaskId, studentId } });
  if (existing != null) {
    const historicalScores = existing.historicalScores.concat(data.historicalScores || []);
    const result = await getRepository(TaskResult).save({ ...existing, ...data, historicalScores });
    setResponse(ctx, OK, result);
    return;
  }
  const result = await getRepository(TaskResult).save(data);
  setResponse(ctx, OK, result);
};
