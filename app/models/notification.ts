import { Document, Schema, model } from 'mongoose';

export interface INotification extends Document {
    dateTime: number;
    eventId: string;
    message: string;
    telegramId: number;
    type: string;
}

export interface INotificationModel extends Document, INotification {
    _id: string;
}

export const NotificationSchema: Schema = new Schema({
    dateTime: { type: Number, required: true },
    eventId: { type: String, required: true },
    message: { type: String, required: true },
    telegramId: { type: Number, required: true },
    type: { type: String, required: true },
});

export const NotificationModelName = 'Notification';
export const NotificationModel = model<INotificationModel>(NotificationModelName, NotificationSchema);
