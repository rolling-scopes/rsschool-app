import { Document, Schema, model } from 'mongoose';

export interface ITime {
    hours: number;
    minutes: number;
}

export interface INotificationsSetting extends Document {
    userId: string;
    telegramId: number;
    isEnable: boolean;
    timeFrom: ITime;
    timeTo: ITime;
}

export interface INotificationsSettingModel extends Document, INotificationsSetting {
    _id: string;
}

export const NotificationsSettingSchema: Schema = new Schema({
    isEnable: { type: Boolean, default: true },
    telegramId: { type: Number, required: true },
    timeFrom: {
        hours: { type: Number, min: 0, max: 24, default: 0 },
        minutes: { type: Number, min: 0, max: 59, default: 0 },
    },
    timeTo: {
        hours: { type: Number, min: 0, max: 24, default: 24 },
        minutes: { type: Number, min: 0, max: 59, default: 0 },
    },
    userId: { type: String, required: true },
});

export const NotificationSettingsModelName = 'NotificationsSetting';
export const NotificationsSettingModel = model<INotificationsSettingModel>(
    NotificationSettingsModelName,
    NotificationsSettingSchema,
);
