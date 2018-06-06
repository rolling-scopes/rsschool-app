import { sessionMiddleware } from './index';
import { IRouterContext } from 'koa-router';

describe('Session', () => {
    it('returns user session', async () => {
        const ctx: IRouterContext = {
            state: {
                user: {
                    _id: 'apalchys',
                },
            },
        } as any;
        await sessionMiddleware(ctx);
        expect(ctx.body).toMatchSnapshot();
        expect(ctx.status).toBe(200);
    });

    it('returns 404 if no user session', async () => {
        const ctx: IRouterContext = {
            state: {},
        } as any;
        await sessionMiddleware(ctx);
        expect(ctx.body).toMatchSnapshot();
        expect(ctx.status).toBe(404);
    });
});
