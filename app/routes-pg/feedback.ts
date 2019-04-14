import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import * as Router from 'koa-router';
import { setResponse } from '../routes/utils';
import { getManager } from 'typeorm';
import { Feedback } from '../models-pg/feedback';

export function feedbackRouter() {
    const router = new Router({ prefix: '/v2/feedback' });

    router.get('/:id', getFeedbackRoute);
    router.post('/', postFeedbackRoute);

    return router;
}

export const getFeedbackRoute = async (ctx: Router.RouterContext) => {
    const feedbackId = ctx.params.id;
    const user = await getManager().findOne(Feedback, Number(feedbackId));
    if (user === undefined) {
        setResponse(ctx, NOT_FOUND);
        return;
    }
    setResponse(ctx, OK, user);
};

export const postFeedbackRoute = async (ctx: Router.RouterContext) => {
    const feedbacks = ctx.request.body as Feedback[];
    console.info(feedbacks);
    try {
        const result = await getManager().save(Feedback, feedbacks);
        setResponse(ctx, OK, result);
    } catch (e) {
        setResponse(ctx, BAD_REQUEST, { message: e.message });
    }
};
