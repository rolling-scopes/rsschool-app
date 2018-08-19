import { IMiddleware } from 'koa-router';
import { SessionType } from '../../models/event';
import { INotificaionData, notify, update, remove } from '../../notificationsSystem';

const hoursToMilliseconds = (hours: number): number => hours * 60 * 60 * 1000;

const getPrettyTime = (dateTime: Date): string => {
    return `${dateTime.getHours()}:${dateTime.getMinutes()}`;
};

const getNotifications = (
    title: string,
    sessionType: string,
    startDateTime: number,
    urlToDescription?: string,
): INotificaionData[] => {
    const notifications = [];

    const beforeEventMessage = `${title} started at ${getPrettyTime(new Date(startDateTime))}${
        urlToDescription ? `\n${urlToDescription}` : ''
    }`;
    const onEventMessage = `${title} started${urlToDescription ? `\n${urlToDescription}` : ''}`;

    switch (sessionType) {
        case SessionType.Online:
            notifications.push(
                { dateTime: startDateTime - hoursToMilliseconds(1), message: beforeEventMessage },
                { dateTime: startDateTime, message: onEventMessage },
            );
            break;
        case SessionType.Offline:
            notifications.push({ dateTime: startDateTime - hoursToMilliseconds(2), message: beforeEventMessage });
            break;
        case SessionType.SelfLearning:
            notifications.push({ dateTime: startDateTime, message: onEventMessage });
            break;
        case SessionType.ExtraEvent:
            notifications.push({ dateTime: startDateTime - hoursToMilliseconds(1), message: beforeEventMessage });
            break;
        default:
    }

    return notifications;
};

export const notificationPostMiddleware: IMiddleware = async (ctx, next) => {
    try {
        const { title, sessionType, startDateTime, urlToDescription } = ctx.body;
        const notifications = getNotifications(title, sessionType, startDateTime, urlToDescription);

        await notify('event', ctx.body._id, notifications);
        next();
    } catch (err) {
        ctx.logger.error(err);
    }
};

export const notificationPatchMiddleware: IMiddleware = async (ctx, next) => {
    try {
        const { title, sessionType, startDateTime, urlToDescription } = ctx.body.data;
        const notifications = getNotifications(title, sessionType, startDateTime, urlToDescription);

        await update('event', ctx.body.data._id, notifications);
        next();
    } catch (err) {
        ctx.logger.error(err);
    }
};

export const notificationRemoveMiddleware: IMiddleware = async (ctx, next) => {
    try {
        const { id } = ctx.params;
        await remove('event', id);
        next();
    } catch (err) {
        ctx.logger.error(err);
    }
};
