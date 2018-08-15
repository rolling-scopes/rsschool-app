import { Document, Schema, model } from 'mongoose';

export enum NotificationTypes {
    TaskAssigned = 'TaskAssigned', //   save in assignments
    TaskRejected = 'TaskRejected', //   update assignment state to rejected
    TaskAccepted = 'TaskAccepted', //   update assignment state to accepted
    TaskReadyForReview = 'TaskReadyForReview', //   update assignment state to readyForReview
    Deadline = 'Deadline', //   save in assigned
    Lecture = 'Lecture', // save in events
}

export interface INotification extends Document {
    date?: number;
    eventId: string;
    type: NotificationTypes;
    userId: string;
}

export interface INotificationModel extends Document, INotification {
    _id: string;
}

export const NotificationSchema: Schema = new Schema({
    date: { type: Number },
    eventId: { type: String, required: true },
    type: { type: String, required: true },
    userId: { type: String, required: true },
});

export const NotificationModelName = 'Notification';
export const NotificationModel = model<INotificationModel>(NotificationModelName, NotificationSchema);
