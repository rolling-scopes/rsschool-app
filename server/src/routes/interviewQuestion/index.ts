import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { InterviewQuestion } from '../../models';
import { anyCoursePowerUserGuard } from '../guards';
import { setResponse } from '../utils';
import { Next } from 'koa';
import { createDeleteRoute } from '../common';

const validateId = async (ctx: Router.RouterContext, next: Next) => {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Id]');
    return;
  }
  ctx.params.id = id;
  await next();
};

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

const updateInterviewQuestion = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const id: number = Number(ctx.params.id);
    const question = ctx.request.body;
    const interviewQuestion = await getRepository(InterviewQuestion).findOne(id);
    const updatedQuestions = await getRepository(InterviewQuestion).save({ ...interviewQuestion, ...question });
    setResponse(ctx, OK, updatedQuestions);
  } catch (error) {
    if (logger) {
      logger.error(error.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: error.message });
  }
};

export function interviewQuestionRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/interview-question' });

  router.get('/', anyCoursePowerUserGuard, getInterviewQuestions(logger));
  router.post('/', anyCoursePowerUserGuard, createInterviewQuestion(logger));
  router.put('/:id', anyCoursePowerUserGuard, validateId, updateInterviewQuestion(logger));
  router.delete('/:id', anyCoursePowerUserGuard, validateId, createDeleteRoute(InterviewQuestion, logger));

  return router;
}
