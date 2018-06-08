import { Schema, model, Document } from 'mongoose';

const FeedRecordScheme: Schema = new Schema({
    actionType: String,
    courseId: String,
    data: Object,
    dateTime: Number,
    entityType: String,
    priority: { type: Number, default: 10 },
    userId: String,
});

const FeedRecordModelName = 'FeedRecord';

export enum FeedPriority {
    Critical = 0,
    High = 5,
    Medium = 10,
    Low = 15,
}

export interface IFeedRecord {
    priority?: FeedPriority;
    dateTime: number;
    actionType: Actions;
    data: any;
    courseId?: string;
    userId: string;
    entityType: FeedEntities;
}

export interface IFeedRecordModel extends Document, IFeedRecord {}

export const FeedRecordModel = model<IFeedRecordModel>(FeedRecordModelName, FeedRecordScheme);

export enum FeedEntities {
    Course = 'Course',
    Task = 'Task',
    User = 'User',
    Event = 'Event',
    Participation = 'Participation',
}

export enum FeedActions {
    'ENROLL' = 'ENROLL',
    'SIGNUP' = 'SIGNUP',
}

type CourseActions = FeedActions.ENROLL;
type UserActions = FeedActions.SIGNUP;

type Actions = CourseActions | UserActions;
