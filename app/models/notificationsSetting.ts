import { Document, Schema, model } from 'mongoose';

import { NotificationTypes } from './notification';

export interface INotificationsSetting extends Document {
    userId: string;
    telegramId: number;
    isEnable: boolean;
    types?: NotificationTypes[];
    timeFrom?: {
        hours: number;
        minutes: number;
    };
    timeTo?: {
        hours: number;
        minutes: number;
    };
}

export interface INotificationsSettingModel extends Document, INotificationsSetting {
    _id: string;
}

export const NotificationsSettingSchema: Schema = new Schema({
    isEnable: { type: Boolean, default: true },
    telegramId: { type: Number, required: true },
    timeFrom: {
        hours: { type: Number, min: 0, max: 24 },
        minutes: { type: Number, min: 0, max: 59 },
    },
    timeTo: {
        hours: { type: Number, min: 0, max: 24 },
        minutes: { type: Number, min: 0, max: 59 },
    },
    types: { type: Array },
    userId: { type: String, required: true },
});

export const NotificationSettingsModelName = 'NotificationsSetting';
export const NotificationsSettingModel = model<INotificationsSettingModel>(
    NotificationSettingsModelName,
    NotificationsSettingSchema,
);
