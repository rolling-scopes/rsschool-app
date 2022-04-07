import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository } from 'typeorm';
import { IGratitudeGetRequest } from '../../../common/interfaces/gratitude';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { ILogger } from '../logger';
import { guard } from './guards';
import { setResponse } from './utils';

const { OK } = StatusCodes;

export function feedbackRoute(_: ILogger) {
  const router = new Router<any, any>({ prefix: '/feedback' });
  router.get('/gratitude', guard, getGratitudeFeedback());
  return router;
}

const getGratitudeFeedback = () => {
  return async (ctx: Router.RouterContext) => {
    const data: IGratitudeGetRequest = ctx.query;
    const feedbackRepository = getCustomRepository(FeedbackRepository);
    const result = await feedbackRepository.getGratitude(data);
    setResponse(ctx, OK, result);
    return;
  };
};
