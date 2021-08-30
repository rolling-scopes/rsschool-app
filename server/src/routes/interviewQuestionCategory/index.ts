import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { anyCoursePowerUserGuard } from '../guards';
import { setResponse } from '../utils';
import { InterviewQuestionCategory } from '../../models/interviewQuestionCategory';
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

const getInterviewQuestionCategories = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const interviewQuestionCategories = await getRepository(InterviewQuestionCategory).find({
      relations: ['questions'],
    });
    setResponse(ctx, OK, interviewQuestionCategories);
  } catch (error) {
    if (logger) {
      logger.error(error.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: error.message });
  }
};

const createInterviewQuestionCategory = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const interviewQuestionCategory = await getRepository(InterviewQuestionCategory).save(ctx.request.body);
    setResponse(ctx, OK, interviewQuestionCategory);
  } catch (error) {
    if (logger) {
      logger.error(error.message);
    }
    setResponse(ctx, BAD_REQUEST, { message: error.message });
  }
};

const updateInterviewQuestionCategory = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  try {
    const category = ctx.request.body;
    const updatedCategory = await getRepository(InterviewQuestionCategory).save(category);
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

  router.get('/', anyCoursePowerUserGuard, getInterviewQuestionCategories(logger));
  router.post('/', anyCoursePowerUserGuard, createInterviewQuestionCategory(logger));
  router.put('/:id', anyCoursePowerUserGuard, validateId, updateInterviewQuestionCategory(logger));
  router.delete('/:id', anyCoursePowerUserGuard, validateId, createDeleteRoute(InterviewQuestionCategory, logger));

  return router;
}
