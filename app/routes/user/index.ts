import * as Router from 'koa-router';
import { getProfileRoute, patchProfileRoute } from './profile';
import { getFeedRoute } from './feed';
import { getParticipationsRoute } from './participations';

export function userRouter() {
    const router = new Router({ prefix: '/user' });

    router.get('/participations', getParticipationsRoute);
    router.get('/feed', getFeedRoute);

    router.get('/profile', getProfileRoute);
    router.patch('/profile', patchProfileRoute);

    return router;
}
