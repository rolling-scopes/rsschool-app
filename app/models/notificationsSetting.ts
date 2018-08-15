import { Document, Schema, model } from 'mongoose';

import { NotificationTypes } from './notification';

export interface INotificationsSetting extends Document {
    userId: string;
    telegramId: number;
    isEnable: boolean;
    types?: NotificationTypes[];
    dateFrom?: {
        hours: number;
        minutes: number;
    };
    dateTo?: {
        hours: number;
        minutes: number;
    };
}

export interface INotificationsSettingModel extends Document, INotificationsSetting {
    _id: string;
}

export const NotificationsSettingSchema: Schema = new Schema({
    dateFrom: {
        hours: { type: Number },
        minutes: { type: Number },
    },
    dateTo: {
        hours: { type: Number },
        minutes: { type: Number },
    },
    isEnable: { type: Boolean, default: true },
    telegramId: { type: Number, required: true },
    types: { type: Array },
    userID: { type: String, required: true },
});

export const NotificationSettingsModelName = 'NotificationsSetting';
export const NotificationsSettingModel = model<INotificationsSettingModel>(
    NotificationSettingsModelName,
    NotificationsSettingSchema,
);
