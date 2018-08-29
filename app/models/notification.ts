import { Document, Schema, model } from 'mongoose';

export enum MentorsNotificationsType {
    NewTask = 'New task',
    TaskReadyForReview = 'Task ready for review',
}

export enum StudentsNotificationsType {
    NewTask = 'New task',
    Deadline = 'Deadline',
    TaskAccepted = 'Task accepted',
    TaskRejected = 'Task rejected',
    Session = 'Session',
}

export interface INotification extends Document {
    dateTime: number;
    eventId: string;
    eventType: MentorsNotificationsType | StudentsNotificationsType;
    message: string;
    telegramId: number;
}

export interface INotificationModel extends Document, INotification {
    _id: string;
}

export const NotificationSchema: Schema = new Schema({
    dateTime: { type: Number, required: true },
    eventId: { type: String, required: true },
    eventType: { type: String, required: true },
    message: { type: String, required: true },
    telegramId: { type: Number, required: true },
});

export const NotificationModelName = 'Notification';
export const NotificationModel = model<INotificationModel>(NotificationModelName, NotificationSchema);
