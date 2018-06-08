import { FeedRecordModel, FeedActions, FeedEntities, FeedPriority } from './feed';

export function saveCourseEnrollFeedAction(userId: string, courseId: string, data: { text: string }) {
    return new FeedRecordModel({
        actionType: FeedActions.ENROLL,
        courseId,
        data,
        dateTime: Date.now(),
        entityType: FeedEntities.Course,
        priority: FeedPriority.High,
        userId,
    }).save();
}

export function saveUserSignupFeedAction(userId: string, data: { text: string }) {
    return new FeedRecordModel({
        actionType: FeedActions.SIGNUP,
        data,
        dateTime: Date.now(),
        entityType: FeedEntities.User,
        priority: FeedPriority.High,
        userId,
    }).save();
}
