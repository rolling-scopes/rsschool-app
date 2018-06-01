import { FeedRecordDocument, FeedActions, FeedEntities, FeedPriority } from './feed';

export function saveCourseEnrollAction(userId: string, courseId: string, data: { text: string }) {
    return new FeedRecordDocument({
        actionType: FeedActions.ENROLL,
        courseId,
        data,
        dateTime: Date.now(),
        entityType: FeedEntities.Course,
        priority: FeedPriority.High,
        userId,
    }).save();
}

export function saveUserSignupAction(userId: string, data: { text: string }) {
    return new FeedRecordDocument({
        actionType: FeedActions.SIGNUP,
        data,
        dateTime: Date.now(),
        entityType: FeedEntities.User,
        priority: FeedPriority.High,
        userId,
    }).save();
}
