import { Document, Schema, model } from 'mongoose';

import { IUserModel } from '../models/user';

export interface ITime {
    hours: number;
    minutes: number;
}

export interface INotificationsSetting extends Document {
    events: string[];
    user: IUserModel | string;
    telegramId: number;
    isEnable: boolean;
    timeFrom: ITime;
    timeTo: ITime;
}

export interface INotificationsSettingModel extends Document, INotificationsSetting {
    _id: string;
}

export const NotificationsSettingSchema: Schema = new Schema({
    events: { type: Array, default: 'all' },
    isEnable: { type: Boolean, default: true },
    telegramId: { type: Number, required: true, unique: true },
    timeFrom: {
        hours: { type: Number, min: 0, max: 24, default: 0 },
        minutes: { type: Number, min: 0, max: 59, default: 0 },
    },
    timeTo: {
        hours: { type: Number, min: 0, max: 24, default: 24 },
        minutes: { type: Number, min: 0, max: 59, default: 0 },
    },
    user: { type: String, ref: 'User' },
});

export const NotificationSettingsModelName = 'NotificationsSetting';
export const NotificationsSettingModel = model<INotificationsSettingModel>(
    NotificationSettingsModelName,
    NotificationsSettingSchema,
);
