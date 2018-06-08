import * as Router from 'koa-router';
import { sessionRoute } from './session';

export function sessionRouter() {
    const router = new Router();

    router.get('/session', sessionRoute);

    return router;
}
