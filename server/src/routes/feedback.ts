import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from './utils';
import { PrivateFeedback } from '../models';
import { ILogger } from '../logger';
import { guard } from './guards';

type FeedbackInput = {
  toUserId: number;
  comment: string;
};

export function feedbackRoute(logger: ILogger) {
  const router = new Router({ prefix: '/feedback' });
  router.post('/private', guard, postPrivateFeedback(logger));
  return router;
}

const postPrivateFeedback = (_: ILogger) => {
  return async (ctx: Router.RouterContext) => {
    const courseId: number = ctx.params.courseId;
    const data: FeedbackInput = ctx.request.body;

    if (isNaN(data.toUserId)) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const id = ctx.state.user.id;
    const feedback: Partial<PrivateFeedback> = {
      comment: data.comment,
      course: courseId,
      fromUser: id,
      toUser: data.toUserId,
    };
    const result = await getRepository(PrivateFeedback).save(feedback);

    setResponse(ctx, OK, result);
    return;
  };
};
