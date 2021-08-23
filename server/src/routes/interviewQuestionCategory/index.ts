import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { createPostRoute } from '../common';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';
import { InterviewQuestionCategory } from '../../models/interviewQuestionCategory';

const getInterviewQuestionCategories = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const interviewQuestions = await getRepository(InterviewQuestionCategory).find();

  setResponse(ctx, OK, interviewQuestions);
};

export function interviewQuestionCategoryRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/interview-question-category' });

  router.get('/', adminGuard, getInterviewQuestionCategories(logger));
  router.post('/', adminGuard, createPostRoute(InterviewQuestionCategory, logger));

  return router;
}
