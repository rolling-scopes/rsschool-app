import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { InterviewQuestion } from '../../models';
import { createPostRoute } from '../common';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';

const getInterviewQuestions = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const interviewQuestions = await getRepository(InterviewQuestion).find({ relations: ['categories'] });
  setResponse(ctx, OK, interviewQuestions);
};

export function interviewQuestionRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/interview-question' });

  router.get('/', adminGuard, getInterviewQuestions(logger));
  router.post('/', adminGuard, createPostRoute(InterviewQuestion, logger));

  return router;
}
