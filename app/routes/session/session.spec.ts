import { sessionRoute } from './session';
import { IRouterContext } from 'koa-router';
import { createTestContext } from '../../utils';

describe('Session route', () => {
    it('returns data', async () => {
        const ctx = createTestContext();
        await sessionRoute(ctx);
        expect(ctx.body).toMatchSnapshot();
        expect(ctx.status).toBe(200);
    });

    it('returns 404 if no user session', async () => {
        const ctx: IRouterContext = {
            state: {},
        } as any;
        await sessionRoute(ctx);
        expect(ctx.body).toMatchSnapshot();
        expect(ctx.status).toBe(404);
    });
});
