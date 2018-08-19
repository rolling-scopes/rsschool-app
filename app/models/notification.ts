import { Document, Schema, model } from 'mongoose';

export interface INotification extends Document {
    dateTime: number;
    eventId: string;
    eventType: string;
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
