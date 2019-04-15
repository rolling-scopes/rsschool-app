import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import * as Router from 'koa-router';
import { setResponse } from '../routes/utils';
import { getManager } from 'typeorm';
import { Course } from '../models-pg/course';

export function courseRouter() {
    const router = new Router({ prefix: '/v2/course' });

    router.get('/:id', getRoute);
    router.post('/', postRoute);

    return router;
}

const getRoute = async (ctx: Router.RouterContext) => {
    const courseId = ctx.params.id;
    const user = await getManager().findOne(Course, Number(courseId));
    if (user === undefined) {
        setResponse(ctx, NOT_FOUND);
        return;
    }
    setResponse(ctx, OK, user);
};

const postRoute = async (ctx: Router.RouterContext) => {
    const data = ctx.request.body as Course[];
    console.info(data);
    try {
        const result = await getManager().save(Course, data);
        setResponse(ctx, OK, result);
    } catch (e) {
        setResponse(ctx, BAD_REQUEST, { message: e.message });
    }
};
