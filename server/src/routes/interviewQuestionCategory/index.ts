import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { adminGuard } from '../guards';
import { setResponse } from '../utils';
import { InterviewQuestionCategory } from '../../models/interviewQuestionCategory';
import { Next } from 'koa';

const validateId = async (ctx: Router.RouterContext, next: Next) => {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    setResponse(ctx, BAD_REQUEST, 'Incorrect [Id]');
    return;
  }
  ctx.params.id = id;
  await next();
};

const getInterviewQuestionCategories = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const interviewQuestions = await getRepository(InterviewQuestionCategory).find({ relations: ['questions'] });
    setResponse(ctx, OK, interviewQuestions);
  } catch (error) {
    if (logger) {
      logger.error(error.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: error.message });
  }
};

const createInterviewQuestionCategory = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const interviewQuestions = await getRepository(InterviewQuestionCategory).save(ctx.request.body);
    setResponse(ctx, OK, interviewQuestions);
  } catch (error) {
    if (logger) {
      logger.error(error.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: error.message });
  }
};

const updateInterviewQuestionCategory = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const id: number = Number(ctx.params.id);
    const category = ctx.request.body;
    const interviewCategory = await getRepository(InterviewQuestionCategory).findOne(id);
    const updatedCategory = await getRepository(InterviewQuestionCategory).save({ ...interviewCategory, ...category });
    setResponse(ctx, OK, updatedCategory);
  } catch (error) {
    if (logger) {
      logger.error(error.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: error.message });
  }
};

export function interviewQuestionCategoryRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/interview-question-category' });

  router.get('/', adminGuard, getInterviewQuestionCategories(logger));
  router.post('/', adminGuard, createInterviewQuestionCategory(logger));
  router.put('/:id', adminGuard, validateId, updateInterviewQuestionCategory(logger));

  return router;
}
