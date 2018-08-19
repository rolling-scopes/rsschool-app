//  TODO

// 1. tests
// 2. system works wrong with time setting like 20:00 - 2:00
// 3. edit notifications if users settings changes
// 4. user timezone
// 5. limits: https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
// 6. refactor notify func

import * as nodeSchedule from 'node-schedule';
import NotificationsBot from './bot';
import { ILogger } from '../logger';
import { INotification } from '../models/notification';
import { notificationService, notificationsSettingService } from '../services/';

let logger: ILogger;

let bot: NotificationsBot;

const getScheduledCallback = (id: string, telegramId: number, message: string) => async () => {
    await notificationService.remove(id);
    bot.send(telegramId, message);
};

const schedule = (notification: INotification) => {
    nodeSchedule.scheduleJob(
        notification.id,
        new Date(notification.dateTime),
        getScheduledCallback(notification.id, notification.telegramId, notification.message),
    );
};

const checkIsInTime = (hours: number, minutes: number, timeFrom: any, timeTo: any) => {
    if (hours >= timeFrom.hours && hours <= timeTo.hours) {
        return true;
    } else if (hours === timeFrom.hours && minutes >= timeFrom.minutes) {
        return true;
    } else if (hours === timeTo.hours && minutes <= timeTo.minutes) {
        return true;
    }

    return false;
};

export const notify = async (data: any) => {
    const currentDate = new Date();

    await notificationsSettingService.forEach(async (setting: any) => {
        if (!setting.isEnable) {
            return;
        }

        const isCurrentTimeInSettingTime = checkIsInTime(
            currentDate.getHours(),
            currentDate.getMinutes(),
            setting.timeFrom,
            setting.timeTo,
        );

        for (const key in data) {
            // tslint:disable:forin
            const item = data[key];
            if (!data.hasOwnProperty(key)) {
                return;
            }
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
                    telegramId: setting.telegramId,
                    ...item,
                    dateTime,
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
                    telegramId: setting.telegramId,
                    ...item,
                    dateTime,
                });
                schedule(notification);
            }
        }
    });
};

// export const remove = (type: string, eventId: string) => {
//     // remove all scheduled jobs and all notifications
// }

const scheduleAll = async () => {
    await notificationService.forEach(schedule);
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
