import * as Router from 'koa-router';
import { getProfileRoute, patchProfileRoute } from './profile';
import { getFeedRoute } from './feed';
import { getParticipationsRoute } from './participations';
import { matchUsers } from './match';

export function userRouter() {
    const router = new Router({ prefix: '/user' });

    router.get('/participations', getParticipationsRoute);
    router.get('/feed', getFeedRoute);

    router.get('/profile', getProfileRoute);
    router.patch('/profile', patchProfileRoute);

    router.post('/match', matchUsers);

    return router;
}
