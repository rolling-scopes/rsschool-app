import mockingoose from 'mockingoose';
import { createTestContext, getLoggerMock } from '../../utils';
import { getProfileRoute, patchProfileRoute } from './profile';

describe('User Profile route', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    it('returns data', async () => {
        const ctx = createTestContext();
        mockingoose.User.toReturn(
            {
                profile: {
                    firstName: 'first name',
                },
            },
            'findOne',
        );
        await getProfileRoute(ctx);
        expect(ctx.status).toBe(200);
        expect(ctx.body).toMatchSnapshot();
    });

    it('allows to patch user profile', async () => {
        const oldProfile = {
            email: '',
            firstName: '',
            lastName: '',
        };
        const profileChanges = {
            firstName: 'Foo',
            lastName: 'Bar',
        };
        const ctx = createTestContext();
        ctx.request.body = profileChanges;
        mockingoose.User.toReturn(
            {
                profile: oldProfile,
            },
            'findOne',
        );
        mockingoose.User.toReturn(null, 'save');
        await patchProfileRoute(ctx);
        expect(ctx.status).toBe(200);
        expect(ctx.body.data.firstName).toBe('Foo');
        expect(ctx.body).toMatchSnapshot();
    });
});
