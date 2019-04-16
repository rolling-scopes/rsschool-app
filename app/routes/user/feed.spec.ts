import mockingoose from 'mockingoose';
import { FeedActions, FeedEntities, IFeedRecordModel } from '../../models';
import { createTestContext } from '../../utils';
import { getFeedRoute } from './feed';

describe('User Feed route', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    xit('returns data', async () => {
        const ctx = createTestContext();
        const feedRecords = [
            {
                _id: '5b19146f65bbc725d2069082',
                actionType: FeedActions.ENROLL,
                courseId: 'course-id',
                data: {},
                dateTime: 0,
                entityType: FeedEntities.User,
                userId: 'apalchys',
            },
        ] as IFeedRecordModel[];

        mockingoose.User.toReturn({}, 'findOne');
        mockingoose.FeedRecord.toReturn(feedRecords, 'find');

        await getFeedRoute(ctx);
        expect(ctx.status).toBe(200);
        expect(ctx.body).toMatchSnapshot();
    });

    xit('returns 404 if no user', async () => {
        const ctx = createTestContext();
        mockingoose.User.toReturn(null, 'findOne');

        await getFeedRoute(ctx);
        expect(ctx.status).toBe(404);
        expect(ctx.body).toMatchSnapshot();
    });
});
