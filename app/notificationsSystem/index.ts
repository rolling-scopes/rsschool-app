/*  TODO

1. tests
2. system works wrong with time setting like 20:00 - 2:00
3. edit notifications if users settings changes
4. user timezone
5. limits: https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
6. refactor notify func
7. check if notification will never be send  */

import * as nodeSchedule from 'node-schedule';
import NotificationsBot from './bot';
import { ILogger } from '../logger';
import { INotification } from '../models/notification';
import { ITime, INotificationsSetting } from '../models/notificationsSetting';
import { notificationService, notificationsSettingService } from '../services/';

let logger: ILogger;

let bot: NotificationsBot;

export interface INotificaionData {
    dateTime?: number;
    message: string;
}

const getScheduledCallback = (id: string, telegramId: number, message: string) => async () => {
    bot.send(telegramId, message);
    await notificationService.removeById(id);
};

const schedule = (notification: INotification) => {
    nodeSchedule.scheduleJob(
        notification.id,
        new Date(notification.dateTime),
        getScheduledCallback(notification.id, notification.telegramId, notification.message),
    );
};

const checkIsInTime = (hours: number, minutes: number, timeFrom: ITime, timeTo: ITime): boolean => {
    if (hours >= timeFrom.hours && hours <= timeTo.hours) {
        return true;
    } else if (hours === timeFrom.hours && minutes >= timeFrom.minutes) {
        return true;
    } else if (hours === timeTo.hours && minutes <= timeTo.minutes) {
        return true;
    }

    return false;
};

export const notify = async (eventType: string, eventId: string, data: INotificaionData[]) => {
    const currentDate = new Date();
    const notificationsSettings = await notificationsSettingService.find({ isEnable: true });

    await notificationsSettings.forEach(async (setting: INotificationsSetting) => {
        const isCurrentTimeInSettingTime = checkIsInTime(
            currentDate.getHours(),
            currentDate.getMinutes(),
            setting.timeFrom,
            setting.timeTo,
        );

        await data.forEach(async (item: INotificaionData) => {
            if (item.dateTime) {
                const dateTime = new Date(item.dateTime);
                const isEventTimeInSettingTime = checkIsInTime(
                    dateTime.getHours(),
                    dateTime.getMinutes(),
                    setting.timeFrom,
                    setting.timeTo,
                );

                if (!isEventTimeInSettingTime) {
                    return;
                }

                const notification = await notificationService.save({
                    dateTime,
                    eventId,
                    eventType,
                    message: item.message,
                    telegramId: setting.telegramId,
                });
                schedule(notification);
            } else if (isCurrentTimeInSettingTime) {
                bot.send(setting.telegramId, item.message);
            } else {
                const dateTime = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() + (currentDate.getHours() < setting.timeFrom.hours ? 0 : 1),
                    setting.timeFrom.hours,
                    setting.timeFrom.minutes,
                );

                const notification = await notificationService.save({
                    dateTime,
                    eventId,
                    eventType,
                    message: item.message,
                    telegramId: setting.telegramId,
                });
                schedule(notification);
            }
        });
    });
};

export const update = async (eventType: string, eventId: string, data: INotificaionData[]) => {
    await remove(eventType, eventId);
    await notify(eventType, eventId, data);
};

export const remove = async (eventType: string, eventId: string) => {
    const removedIds = await notificationService.removeByEvent(eventType, eventId);
    removedIds.forEach((item: string) => {
        if (nodeSchedule.scheduledJobs[item]) {
            nodeSchedule.scheduledJobs[item].cancel();
        }
    });
};

const scheduleAll = async () => {
    const notifications = await notificationService.find();
    notifications.forEach(schedule);
};

export const start = async (notificationsLogger: ILogger) => {
    logger = notificationsLogger;

    logger.info('Notification system started');
    bot = new NotificationsBot(logger);
    bot.start();
    logger.info('Notifications sheduling');
    await scheduleAll();
    logger.info('Notifications scheduled');
};
