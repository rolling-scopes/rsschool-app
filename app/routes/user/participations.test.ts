import mockingoose from 'mockingoose';
import { createTestContext } from '../../utils';
import { getParticipationsRoute } from './participations';

describe('User Participations route', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    it('returns data', async () => {
        const ctx = createTestContext();
        mockingoose.User.toReturn(
            {
                _id: 'apalchys',
                profile: {},
            },
            'findOne',
        );
        await getParticipationsRoute(ctx);
        expect(ctx.status).toBe(200);
        expect(ctx.body).toMatchSnapshot();
    });
});
