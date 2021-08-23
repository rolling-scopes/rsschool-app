import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { InterviewQuestion } from '../../models';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';

const getInterviewQuestions = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const interviewQuestions = await getRepository(InterviewQuestion).find({ relations: ['categories'] });
    setResponse(ctx, OK, interviewQuestions);
  } catch (error) {
    if (logger) {
      logger.error(error.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: error.message });
  }
};

const createInterviewQuestion = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const interviewQuestions = await getRepository(InterviewQuestion).save(ctx.request.body);
    setResponse(ctx, OK, interviewQuestions);
  } catch (error) {
    if (logger) {
      logger.error(error.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: error.message });
  }
};

export function interviewQuestionRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/interview-question' });

  router.get('/', adminGuard, getInterviewQuestions(logger));
  router.post('/', adminGuard, createInterviewQuestion(logger));

  return router;
}
